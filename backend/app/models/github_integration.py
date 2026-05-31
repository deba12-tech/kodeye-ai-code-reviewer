from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class GithubIntegration(Base):
    __tablename__ = "github_integrations"

    id = Column(Integer, primary_key=True, index=True)
    github_user_id = Column(String, nullable=True)
    github_username = Column(String, nullable=True)
    access_token = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    user = relationship("User", back_populates="github_integration")
