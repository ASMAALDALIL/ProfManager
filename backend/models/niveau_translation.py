from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class NiveauTranslation(Base):
    __tablename__ = "niveau_translations"

    id = Column(Integer, primary_key=True)
    niveau_id = Column(Integer, ForeignKey("niveaux.id"))
    lang = Column(String, nullable=False)
    label = Column(String, nullable=False)
