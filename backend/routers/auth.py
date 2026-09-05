import random
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status, Header
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from database import get_db
from models.professeur import Professeur
from schemas.professeur import ProfesseurCreate, LoginSchema
from utils import hash_password, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from .lang import get_lang

router = APIRouter(prefix="/auth", tags=["Authentification"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

temp_db = {}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token invalide")
    except JWTError:
        raise HTTPException(status_code=401, detail="Session expirée")
        
    user = db.query(Professeur).filter(Professeur.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
    return user

@router.post("/send-code")
async def send_code(email: str, db: Session = Depends(get_db)):
    # 1. Vérifier si l'utilisateur existe déjà
    user = db.query(Professeur).filter(Professeur.email == email).first()
    if user:
        raise HTTPException(status_code=400, detail="Cet email est déjà enregistré.")
    
    # 2. Générer le code
    code = str(random.randint(1000, 9999))
    temp_db[email] = code
    
    # 3. Contournement SMTP : affichage direct dans les logs Render
    print("=" * 50)
    print(f"👉 CODE DE CONFIRMATION POUR {email} : {code}")
    print("=" * 50)
    
    return {
        "message": "Code envoyé avec succès",
        "code": code
    }

@router.post("/verify-code")
async def verify_code(email: str, code: str):
    if email in temp_db and temp_db[email] == code:
        return {"message": "Code valide"}
    raise HTTPException(status_code=400, detail="Code incorrect.")

@router.post("/register", response_model=ProfesseurCreate)
def register(obj_in: ProfesseurCreate, db: Session = Depends(get_db), lang: str = Depends(get_lang)):
    email = obj_in.email
    if email not in temp_db:
        msg = "Veuillez d'abord vérifier votre email" if lang == "fr" else "يرجى التحقق من بريدك الإلكتروني أولاً"
        raise HTTPException(status_code=400, detail=msg)
    
    user = db.query(Professeur).filter(Professeur.email == email).first()
    if user:
        msg = "Email déjà utilisé" if lang == "fr" else "البريد الإلكتروني مستخدم بالفعل"
        raise HTTPException(status_code=400, detail=msg)
    
    hashed_pwd = hash_password(obj_in.mot_de_passe)
    new_user = Professeur(
        nom=obj_in.nom,
        prenom=obj_in.prenom,
        email=obj_in.email,
        telephone=obj_in.telephone,
        cycle_id=obj_in.cycle_id,
        mot_de_passe=hashed_pwd
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if email in temp_db:
        del temp_db[email]
        
    return new_user

@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db), lang: str = Depends(get_lang)):
    user = db.query(Professeur).filter(Professeur.email == data.email).first()
    if not user or not verify_password(data.mot_de_passe, user.mot_de_passe):
        msg = "Email ou mot de passe incorrect" if lang == "fr" else "البريد الإلكتروني أو كلمة المرور غير صحيحة"
        raise HTTPException(status_code=401, detail=msg)
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
