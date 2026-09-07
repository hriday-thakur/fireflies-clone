"""
Pydantic schemas — these define the shape of JSON going in and out of the API.
Separate from models.py (SQLAlchemy) on purpose: models describe the DB,
schemas describe the API contract. Keeping them separate means we can hide
internal fields (like owner_id) from API responses.
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ParticipantBase(BaseModel):
    name: str
    email: Optional[str] = None


class ParticipantOut(ParticipantBase):
    id: int

    class Config:
        from_attributes = True


class TranscriptSegmentOut(BaseModel):
    id: int
    speaker_name: str
    start_time_seconds: float
    end_time_seconds: float
    text: str
    order_index: int

    class Config:
        from_attributes = True


class TopicOut(BaseModel):
    id: int
    title: str
    start_time_seconds: float
    order_index: int

    class Config:
        from_attributes = True


class SummaryOut(BaseModel):
    overview: str
    generated_at: datetime

    class Config:
        from_attributes = True


class ActionItemCreate(BaseModel):
    text: str
    assignee: Optional[str] = None
    is_completed: bool = False
    source_segment_id: Optional[int] = None


class ActionItemUpdate(BaseModel):
    text: Optional[str] = None
    assignee: Optional[str] = None
    is_completed: Optional[bool] = None


class ActionItemOut(BaseModel):
    id: int
    meeting_id: int
    text: str
    assignee: Optional[str] = None
    is_completed: bool
    source_segment_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MeetingListOut(BaseModel):
    id: int
    title: str
    date: datetime
    duration_seconds: int
    participants: List[ParticipantOut]

    class Config:
        from_attributes = True


class MeetingDetailOut(BaseModel):
    id: int
    title: str
    date: datetime
    duration_seconds: int
    media_url: Optional[str] = None
    participants: List[ParticipantOut]
    segments: List[TranscriptSegmentOut]
    topics: List[TopicOut]
    action_items: List[ActionItemOut]
    summary: Optional[SummaryOut] = None

    class Config:
        from_attributes = True


class MeetingCreate(BaseModel):
    title: str
    date: Optional[datetime] = None
    participant_names: List[str] = []
    transcript_text: Optional[str] = None


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    participant_names: Optional[List[str]] = None
