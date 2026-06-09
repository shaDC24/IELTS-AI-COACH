from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base
from datetime import datetime
import uuid

class WritingEvaluation(Base):
    __tablename__ = "writing_evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    task_type = Column(String)  # "task1" or "task2"
    essay = Column(Text)
    task_response = Column(Float)
    coherence = Column(Float)
    lexical_resource = Column(Float)
    grammar = Column(Float)
    overall_band = Column(Float)
    feedback = Column(JSONB)
    improved_essay = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SpeakingEvaluation(Base):
    __tablename__ = "speaking_evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    question = Column(Text)
    transcript = Column(Text)
    fluency = Column(Float)
    grammar = Column(Float)
    vocabulary = Column(Float)
    pronunciation = Column(Float)
    overall_band = Column(Float)
    feedback = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)