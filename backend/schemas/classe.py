from pydantic import BaseModel

class ClasseBase(BaseModel):
    nom: str  # Changé en str
    niveau_id: int
    cycle_id: int

class ClasseCreate(ClasseBase):
    pass

class Classe(ClasseBase):
    id: int
    professeur_id: int
    class Config:
        from_attributes = True