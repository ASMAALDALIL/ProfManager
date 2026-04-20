from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class CycleTranslation(Base):
    __tablename__ = "cycle_translations"

    id = Column(Integer, primary_key=True)
    cycle_id = Column(Integer, ForeignKey("cycles.id"))
    lang = Column(String, nullable=False)  # ar / fr
    label = Column(String, nullable=False)
