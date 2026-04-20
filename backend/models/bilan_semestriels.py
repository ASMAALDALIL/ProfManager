from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class BilanSemestriel(Base):
    __tablename__ = "bilans_semestriels"

    id = Column(Integer, primary_key=True, index=True)
    id_etudiant = Column(Integer, ForeignKey("etudiants.id", ondelete="CASCADE"))
    id_classe = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"))

    note_ia = Column(Float)
    remarque_ia = Column(String)
    semestre = Column(Integer, nullable=False)

    note_finale = Column(Float)
    remarque_finale = Column(String)
    
    a_ete_modifie = Column(Integer, default=0) # 0: non, 1: oui
    date_validation = Column(DateTime(timezone=True), server_default=func.now())

    etudiant = relationship("Etudiant")
    classe = relationship("Classe")