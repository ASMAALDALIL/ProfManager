from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BilanBase(BaseModel):
    id_etudiant: int
    id_classe: int
    semestre: int
    note_ia: float
    remarque_ia: str
    note_finale: float
    remarque_finale: str

class BilanCreate(BilanBase):
    pass

class BilanUpdate(BaseModel):
    note_finale: float
    remarque_finale: str
    a_ete_modifie: int = 1

class BilanResponse(BilanBase):
    id: int
    date_validation: datetime
    class Config:
        from_attributes = True