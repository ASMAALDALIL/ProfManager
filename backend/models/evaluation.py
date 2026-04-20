from sqlalchemy import Column, Integer, Boolean, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from database import Base

class Evaluation(Base):
    __tablename__ = "evaluations"
    id = Column(Integer, primary_key=True, index=True)
    id_classe = Column(Integer, ForeignKey("classes.id"))
    id_session = Column(Integer, ForeignKey("sessions.id"))
    id_etudiant = Column(Integer, ForeignKey("etudiants.id"))
    
    # Logique demandée : True = Présent (1), False = Absent (0)
    absences = Column(Boolean, default=True) 
    participation = Column(Integer, default=0)
    comportement = Column(Integer, default=5)
    organisation_oublis = Column(Boolean, default=False)
    devoirs_non_fait = Column(Boolean, default=False)

    __table_args__ = (
        CheckConstraint('participation >= 0 AND participation <= 5'),
        CheckConstraint('comportement >= 0 AND comportement <= 5'),
    )
    
    session = relationship("Session", back_populates="evaluations")
    etudiant = relationship("Etudiant")