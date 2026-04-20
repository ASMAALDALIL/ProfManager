from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Niveau(Base):
    __tablename__ = "niveaux"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, nullable=False)  # 1AC, 2AC...
    cycle_id = Column(Integer, ForeignKey("cycles.id"))
