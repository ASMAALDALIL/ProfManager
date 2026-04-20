import random
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status, Header
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
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

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "ProfManager.service@gmail.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "uwzq xwuf zlkr chbv"),
    MAIL_FROM=os.getenv("MAIL_USERNAME", "ProfManager.service@gmail.com"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

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

async def send_verification_email(email: str, code: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">ProfManager</h2>
        <p>Votre code de confirmation est :</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; border-radius: 8px;">
            {code}
        </div>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <div dir="rtl" style="text-align: right;">
            <p>رمز التحقق الخاص بك هو: <strong>{code}</strong></p>
            <p>مرحباً بك في ProfManager.</p>
        </div>
    </div>
    """
    message = MessageSchema(
        subject="Code de vérification - ProfManager",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    await fm.send_message(message)

@router.post("/send-code")
async def send_code(email: str, db: Session = Depends(get_db)):
    # 1. Vérifier si l'utilisateur existe déjà
    user = db.query(Professeur).filter(Professeur.email == email).first()
    if user:
        raise HTTPException(status_code=400, detail="Cet email est déjà enregistré.")
    
    # 2. Générer le code
    code = str(random.randint(1000, 9999))
    temp_db[email] = code
    
    # 3. Envoyer l'email DIRECTEMENT (on attend qu'il soit envoyé)
    try:
        await send_verification_email(email, code)
        return {"message": "Code envoyé avec succès"}
    except Exception as e:
        print(f"Erreur SMTP : {e}")
        raise HTTPException(
            status_code=500, 
            detail="Erreur lors de l'envoi de l'email. Vérifiez la configuration SMTP."
        )

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
