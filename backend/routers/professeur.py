from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.professeur import Professeur
from schemas.professeur import Professeur as ProfesseurSchema, ProfesseurUpdate
from .auth import get_current_user, hash_password, verify_password
from pydantic import BaseModel

router = APIRouter(prefix="/professeur", tags=["Profil Professeur"])

class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str

@router.get("/me", response_model=ProfesseurSchema)
def get_my_profile(current_user: Professeur = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=ProfesseurSchema)
def update_profile(
    obj_in: ProfesseurUpdate, 
    db: Session = Depends(get_db), 
    current_user: Professeur = Depends(get_current_user)
):
    for field, value in obj_in.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/password")
def update_password(
    pass_data: PasswordUpdate, 
    db: Session = Depends(get_db), 
    current_user: Professeur = Depends(get_current_user)
):
    if not verify_password(pass_data.old_password, current_user.mot_de_passe):
        raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")
    
    current_user.mot_de_passe = hash_password(pass_data.new_password)
    db.commit()
    return {"message": "Mot de passe mis à jour avec succès"}