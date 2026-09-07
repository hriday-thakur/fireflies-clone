"""
Bonus feature: global search across ALL meetings — both titles and transcript
text — so the user can find any meeting from a single search box.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from .. import models
from ..database import get_db

router = APIRouter(tags=["search"])


@router.get("/search")
def global_search(q: str, db: Session = Depends(get_db)):
    meetings_by_title = (
        db.query(models.Meeting).filter(models.Meeting.title.ilike(f"%{q}%")).all()
    )
    segments = (
        db.query(models.TranscriptSegment)
        .options(joinedload(models.TranscriptSegment.meeting))
        .filter(models.TranscriptSegment.text.ilike(f"%{q}%"))
        .limit(50)
        .all()
    )

    meeting_ids_seen = {m.id for m in meetings_by_title}
    results = [{"type": "meeting", "meeting_id": m.id, "title": m.title} for m in meetings_by_title]

    for seg in segments:
        if seg.meeting_id not in meeting_ids_seen:
            results.append({
                "type": "transcript",
                "meeting_id": seg.meeting_id,
                "meeting_title": seg.meeting.title,
                "snippet": seg.text,
                "start_time_seconds": seg.start_time_seconds,
            })

    return results
