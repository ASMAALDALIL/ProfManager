from sqlalchemy import Column, Integer, String
from database import Base

class Cycle(Base):
    __tablename__ = "cycles"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)  # COLLEGE / LYCEE
