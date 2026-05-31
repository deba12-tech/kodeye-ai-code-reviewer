from sqlalchemy import Column, Integer, String, Float
from app.db.database import Base

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    price = Column(Float, default=0.0)
    features = Column(String, nullable=True)
