from pydantic import BaseModel
from typing import Optional

class EtudiantBase(BaseModel):
    nom_complet: str
    code_massar: str
    id_classe: int

class EtudiantCreate(EtudiantBase):
    
    id_professeur: Optional[int]=None

class EtudiantUpdate(BaseModel):
    nom_complet: Optional[str] = None
    code_massar: Optional[str] = None
    id_classe: Optional[int] = None

class Etudiant(EtudiantBase):
    id: int
    id_professeur: int

    class Config:
        from_attributes = True