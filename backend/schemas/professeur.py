from pydantic import BaseModel, EmailStr
from typing import Optional

class ProfesseurBase(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    telephone: Optional[str] = None
    cycle_id: int

class ProfesseurCreate(ProfesseurBase):
    mot_de_passe: str

class ProfesseurUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    cycle_id: Optional[int] = None

class LoginSchema(BaseModel):
    email: EmailStr
    mot_de_passe: str

class Professeur(ProfesseurBase):
    id: int
    class Config:
        from_attributes = True