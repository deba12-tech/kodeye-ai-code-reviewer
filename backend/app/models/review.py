from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String, nullable=False)
    language = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    summary = Column(Text, nullable=True)
    improved_code = Column(Text, nullable=True)
    source_provider = Column(String, nullable=True)
    source_repo = Column(String, nullable=True)
    source_branch = Column(String, nullable=True)
    source_path = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
    issues = relationship("Issue", back_populates="review", cascade="all, delete-orphan")
