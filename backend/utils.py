from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration de la sécurité
SECRET_KEY = os.getenv("SECRET_KEY", "une_cle_tres_secrete_et_longue_123456") 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Fonctions de Hachage ---
def hash_password(password: str):
    # Correction : Bcrypt ne supporte pas plus de 72 octets.
    # On encode en utf-8 et on tronque pour éviter l'erreur ValueError.
    truncated_password = password.encode('utf-8')[:72]
    return pwd_context.hash(truncated_password.decode('utf-8', errors='ignore'))

def verify_password(plain_password: str, hashed_password: str):
    # On applique la même troncature à la vérification
    truncated_plain = plain_password.encode('utf-8')[:72]
    return pwd_context.verify(truncated_plain.decode('utf-8', errors='ignore'), hashed_password)

# --- Fonction JWT ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
