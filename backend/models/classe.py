from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Classe(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    niveau_id = Column(Integer, ForeignKey("niveaux.id"))
    cycle_id = Column(Integer, ForeignKey("cycles.id"))
    professeur_id = Column(Integer, ForeignKey("professeurs.id"))

    etudiants = relationship("Etudiant", back_populates="classe", cascade="all, delete-orphan")
    
    professeur = relationship("Professeur", back_populates="classes")
    sessions = relationship("Session", back_populates="classe", cascade="all, delete-orphan")