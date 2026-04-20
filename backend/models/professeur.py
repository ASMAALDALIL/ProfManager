from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Professeur(Base):
    __tablename__ = "professeurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String)
    prenom = Column(String)
    email = Column(String, unique=True, index=True)
    telephone = Column(String)
    mot_de_passe = Column(String)
    cycle_id = Column(Integer, ForeignKey("cycles.id"))

    classes = relationship("Classe", back_populates="professeur")