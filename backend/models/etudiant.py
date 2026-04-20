from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class Etudiant(Base):
    __tablename__ = "etudiants"

    id = Column(Integer, primary_key=True, index=True)
    nom_complet = Column(String, nullable=False)
    code_massar = Column(String, nullable=False)
    id_classe = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    
    # On force la présence de l'ID professeur ici au niveau de la DB
    id_professeur = Column(Integer, ForeignKey("professeurs.id", ondelete="CASCADE"), nullable=False)
    
    classe = relationship("Classe", back_populates="etudiants")
    
    professeur = relationship("Professeur")

    __table_args__ = (
        UniqueConstraint('code_massar', 'id_professeur', name='_etudiant_unique_par_prof'),
    )