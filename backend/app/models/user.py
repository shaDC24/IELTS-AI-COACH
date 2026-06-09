from sqlalchemy import Column, String, Float, Integer, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from datetime import datetime
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)

    # IELTS profile
    target_band = Column(Float, default=7.0)
    current_level = Column(Float, default=5.0)
    exam_date = Column(String, nullable=True)
    weak_skills = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.utcnow)