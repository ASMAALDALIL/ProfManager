import bcrypt
from datetime import datetime, timedelta
from jose import jwt
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "une_cle_tres_secrete_et_longue_123456")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

# --- Fonctions de Hachage ---
def hash_password(password: str) -> str:
    truncated = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(truncated, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    truncated = plain_password.encode('utf-8')[:72]
    return bcrypt.checkpw(truncated, hashed_password.encode('utf-8'))

# --- Fonction JWT ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
