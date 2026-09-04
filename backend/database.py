import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("L'URL de la base de données (DATABASE_URL) n'est pas configurée dans le fichier .env")

# Correction du dialecte si l'URL commence par postgres://
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# pool_pre_ping teste la connexion avant de l'utiliser (vital pour Neon/Supabase)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,       
    pool_recycle=300,        
    pool_size=5,              
    max_overflow=20          
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()