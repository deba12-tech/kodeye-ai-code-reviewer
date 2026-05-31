from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    category = Column(String, nullable=False)
    line_number = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    suggested_fix = Column(Text, nullable=True)
    fixed_code = Column(Text, nullable=True)
    status = Column(String, default="Open", nullable=False)
    github_issue_url = Column(String, nullable=True)
    github_repo = Column(String, nullable=True)

    review_id = Column(Integer, ForeignKey("reviews.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    review = relationship("Review", back_populates="issues")
    user = relationship("User", back_populates="issues")
