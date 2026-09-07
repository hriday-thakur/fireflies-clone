"""
Seeds the database with a default user and 4 realistic meetings (each with a
full transcript, generated summary, topics, and action items) so the app is
immediately usable after setup.

Run with:  python -m app.seed
"""
from datetime import datetime, timedelta
from .database import SessionLocal, Base, engine
from . import models
from .utils import parse_transcript, generate_mock_summary, generate_mock_topics, generate_mock_action_items

SAMPLE_TRANSCRIPTS = [
    {
        "title": "Q3 Product Roadmap Sync",
        "participants": ["Alex Carter", "Priya Nair", "Jordan Lee"],
        "days_ago": 1,
        "text": """
[00:00:05] Alex Carter: Thanks everyone for joining. Let's kick off the Q3 roadmap sync.
[00:00:20] Priya Nair: Sure, I'll start with the design updates from last sprint.
[00:00:45] Priya Nair: We finished the new onboarding flow and it should be ready for review by Friday.
[00:01:10] Jordan Lee: Nice. On the engineering side, we will need to refactor the auth service before we can ship that.
[00:01:40] Alex Carter: Let's follow up with the infra team about the auth refactor timeline.
[00:02:05] Jordan Lee: I'll ping them today and share an update in the channel.
[00:02:30] Priya Nair: Should we also revisit the pricing page copy this sprint?
[00:02:50] Alex Carter: Yes, let's add that as an action item for marketing.
[00:03:10] Jordan Lee: I'll draft the technical requirements doc and share it by Wednesday.
[00:03:40] Alex Carter: Great, let's wrap up here. Next sync same time next week.
""",
    },
    {
        "title": "Customer Onboarding Call - Acme Corp",
        "participants": ["Alex Carter", "Sam Rivera"],
        "days_ago": 3,
        "text": """
[00:00:10] Sam Rivera: Hi Alex, thanks for making time today.
[00:00:25] Alex Carter: Of course! Excited to get Acme set up on the platform.
[00:00:50] Sam Rivera: We mainly need help configuring the integration with our CRM.
[00:01:15] Alex Carter: Got it, I'll send over the integration guide right after this call.
[00:01:45] Sam Rivera: Also, our team needs an admin seat added for our ops lead.
[00:02:05] Alex Carter: I will add that seat by end of day.
[00:02:30] Sam Rivera: One more thing, can we schedule a training session for our team next week?
[00:02:55] Alex Carter: Absolutely, let's follow up over email to find a time.
""",
    },
    {
        "title": "Engineering Standup",
        "participants": ["Jordan Lee", "Priya Nair", "Morgan Blake"],
        "days_ago": 5,
        "text": """
[00:00:05] Jordan Lee: Morning everyone, let's go around with quick updates.
[00:00:20] Priya Nair: I finished the dashboard redesign, opening a PR today.
[00:00:45] Morgan Blake: I'm still blocked on the staging environment, need to follow up with DevOps.
[00:01:10] Jordan Lee: I will reach out to DevOps right after standup.
[00:01:35] Priya Nair: Should we also plan the sprint retro for Friday?
[00:01:55] Morgan Blake: Yes, let's put that on the calendar.
[00:02:20] Jordan Lee: Sounds good, that's it for today, thanks all.
""",
    },
    {
        "title": "Marketing Campaign Planning",
        "participants": ["Priya Nair", "Sam Rivera", "Alex Carter"],
        "days_ago": 7,
        "text": """
[00:00:05] Priya Nair: Let's plan the launch campaign for the new feature.
[00:00:30] Sam Rivera: I think we should target email and social in the first week.
[00:00:55] Alex Carter: Agreed, I'll draft the email copy by Thursday.
[00:01:20] Sam Rivera: I will coordinate with design for the social graphics.
[00:01:45] Priya Nair: Let's also set up a landing page for signups.
[00:02:10] Alex Carter: I'll follow up with the web team about the landing page timeline.
[00:02:35] Priya Nair: Great, let's reconvene early next week to review progress.
""",
    },
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.User).first():
            print("Database already seeded, skipping. (Delete fireflies.db to reseed.)")
            return

        user = models.User(name="Alex Carter", email="alex@fireflies-clone.dev")
        db.add(user)
        db.flush()

        participant_cache = {}

        def get_participant(name):
            if name not in participant_cache:
                p = models.Participant(name=name)
                db.add(p)
                db.flush()
                participant_cache[name] = p
            return participant_cache[name]

        for sample in SAMPLE_TRANSCRIPTS:
            meeting = models.Meeting(
                title=sample["title"],
                date=datetime.utcnow() - timedelta(days=sample["days_ago"]),
                owner_id=user.id,
                media_url=None,
            )
            for name in sample["participants"]:
                meeting.participants.append(get_participant(name))

            db.add(meeting)
            db.flush()

            parsed_segments = parse_transcript(sample["text"])
            segment_objs = []
            for seg in parsed_segments:
                obj = models.TranscriptSegment(meeting_id=meeting.id, **seg)
                db.add(obj)
                segment_objs.append(obj)
            db.flush()

            meeting.duration_seconds = int(segment_objs[-1].end_time_seconds) if segment_objs else 0

            db.add(models.Summary(meeting_id=meeting.id, overview=generate_mock_summary(parsed_segments)))

            for t in generate_mock_topics(parsed_segments):
                db.add(models.Topic(meeting_id=meeting.id, **t))

            for item in generate_mock_action_items(parsed_segments):
                matching_segment = next((s for s in segment_objs if s.text == item["text"]), None)
                db.add(models.ActionItem(
                    meeting_id=meeting.id,
                    text=item["text"],
                    assignee=item["assignee"],
                    source_segment_id=matching_segment.id if matching_segment else None,
                ))

        db.commit()
        print(f"Seed complete: {len(SAMPLE_TRANSCRIPTS)} meetings created.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
