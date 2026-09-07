"""
All /meetings endpoints: list (with search/filter/sort), create, get, update,
delete, transcript upload, and in-meeting transcript search.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime

from .. import models, schemas
from ..database import get_db
from ..utils import parse_transcript, generate_mock_summary, generate_mock_action_items, generate_mock_topics

router = APIRouter(prefix="/meetings", tags=["meetings"])


def get_or_create_participant(db: Session, name: str) -> models.Participant:
    p = db.query(models.Participant).filter(models.Participant.name == name).first()
    if not p:
        p = models.Participant(name=name)
        db.add(p)
        db.flush()
    return p


def _populate_transcript(db: Session, meeting: models.Meeting, transcript_text: str):
    """Shared logic: parse raw text -> segments, summary, topics, action items."""
    parsed_segments = parse_transcript(transcript_text)
    segment_objs = []
    for seg in parsed_segments:
        segment_obj = models.TranscriptSegment(meeting_id=meeting.id, **seg)
        db.add(segment_obj)
        segment_objs.append(segment_obj)
    db.flush()  # assigns real IDs to segment_objs

    if segment_objs:
        meeting.duration_seconds = int(segment_objs[-1].end_time_seconds)

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


@router.get("", response_model=List[schemas.MeetingListOut])
def list_meetings(
    q: Optional[str] = None,
    participant: Optional[str] = None,
    sort: Optional[str] = "recent",
    db: Session = Depends(get_db),
):
    query = db.query(models.Meeting).options(joinedload(models.Meeting.participants))

    if q:
        query = query.filter(models.Meeting.title.ilike(f"%{q}%"))

    if participant:
        query = query.join(models.Meeting.participants).filter(
            models.Participant.name.ilike(f"%{participant}%")
        )

    if sort == "oldest":
        query = query.order_by(models.Meeting.date.asc())
    elif sort == "title":
        query = query.order_by(models.Meeting.title.asc())
    else:
        query = query.order_by(models.Meeting.date.desc())

    return query.all()


@router.post("", response_model=schemas.MeetingDetailOut)
def create_meeting(payload: schemas.MeetingCreate, db: Session = Depends(get_db)):
    default_owner = db.query(models.User).first()
    meeting = models.Meeting(
        title=payload.title,
        date=payload.date or datetime.utcnow(),
        owner_id=default_owner.id if default_owner else None,
    )
    for name in payload.participant_names:
        meeting.participants.append(get_or_create_participant(db, name))

    db.add(meeting)
    db.flush()  # get meeting.id before creating dependent rows

    if payload.transcript_text:
        _populate_transcript(db, meeting, payload.transcript_text)

    db.commit()
    db.refresh(meeting)
    return meeting


@router.post("/{meeting_id}/transcript/upload", response_model=schemas.MeetingDetailOut)
async def upload_transcript(meeting_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    content = (await file.read()).decode("utf-8", errors="ignore")

    # wipe any previously generated transcript/summary/topics before re-populating
    db.query(models.TranscriptSegment).filter(models.TranscriptSegment.meeting_id == meeting_id).delete()
    db.query(models.Topic).filter(models.Topic.meeting_id == meeting_id).delete()
    db.query(models.Summary).filter(models.Summary.meeting_id == meeting_id).delete()
    db.flush()

    _populate_transcript(db, meeting, content)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("/{meeting_id}", response_model=schemas.MeetingDetailOut)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.put("/{meeting_id}", response_model=schemas.MeetingDetailOut)
def update_meeting(meeting_id: int, payload: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if payload.title is not None:
        meeting.title = payload.title

    if payload.participant_names is not None:
        meeting.participants = [get_or_create_participant(db, n) for n in payload.participant_names]

    meeting.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(meeting)
    return meeting


@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()
    return {"ok": True}


@router.get("/{meeting_id}/transcript/search")
def search_transcript(meeting_id: int, q: str, db: Session = Depends(get_db)):
    return (
        db.query(models.TranscriptSegment)
        .filter(
            models.TranscriptSegment.meeting_id == meeting_id,
            models.TranscriptSegment.text.ilike(f"%{q}%"),
        )
        .order_by(models.TranscriptSegment.order_index)
        .all()
    )
