"""
SQLAlchemy models — these Python classes map directly to database tables.
Schema:
  User 1---N Meeting
  Meeting N---N Participant   (via meeting_participants join table)
  Meeting 1---N TranscriptSegment
  Meeting 1---N Topic
  Meeting 1---N ActionItem
  Meeting 1---1 Summary
"""
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Table
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# Join table for the many-to-many Meeting <-> Participant relationship.
meeting_participants = Table(
    "meeting_participants",
    Base.metadata,
    Column("meeting_id", Integer, ForeignKey("meetings.id"), primary_key=True),
    Column("participant_id", Integer, ForeignKey("participants.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)

    meetings = relationship("Meeting", back_populates="owner")


class Participant(Base):
    __tablename__ = "participants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=True)

    meetings = relationship(
        "Meeting", secondary=meeting_participants, back_populates="participants"
    )


class Meeting(Base):
    __tablename__ = "meetings"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    duration_seconds = Column(Integer, default=0)
    media_url = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="meetings")
    participants = relationship(
        "Participant", secondary=meeting_participants, back_populates="meetings"
    )
    segments = relationship(
        "TranscriptSegment",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="TranscriptSegment.order_index",
    )
    action_items = relationship(
        "ActionItem", back_populates="meeting", cascade="all, delete-orphan"
    )
    topics = relationship(
        "Topic",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="Topic.order_index",
    )
    summary = relationship(
        "Summary", back_populates="meeting", uselist=False, cascade="all, delete-orphan"
    )


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    speaker_name = Column(String, nullable=False)
    start_time_seconds = Column(Float, nullable=False)
    end_time_seconds = Column(Float, nullable=False)
    text = Column(Text, nullable=False)
    order_index = Column(Integer, nullable=False)

    meeting = relationship("Meeting", back_populates="segments")


class Summary(Base):
    __tablename__ = "summaries"
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), unique=True)
    overview = Column(Text, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="summary")


class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    title = Column(String, nullable=False)
    start_time_seconds = Column(Float, nullable=False)
    order_index = Column(Integer, nullable=False)

    meeting = relationship("Meeting", back_populates="topics")


class ActionItem(Base):
    __tablename__ = "action_items"
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    text = Column(Text, nullable=False)
    assignee = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)
    source_segment_id = Column(Integer, ForeignKey("transcript_segments.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="action_items")
