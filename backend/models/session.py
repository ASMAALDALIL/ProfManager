from sqlalchemy import Column, Integer, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    date_session = Column(Date, nullable=False)
    heure_session = Column(Time, nullable=False)
    semestre = Column(Integer, default=1)
    id_classe = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"))

    classe = relationship("Classe", back_populates="sessions")
    evaluations = relationship("Evaluation", back_populates="session", cascade="all, delete-orphan")