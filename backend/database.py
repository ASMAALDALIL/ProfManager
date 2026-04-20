import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Charge les variables d'environnement depuis le fichier .env
load_dotenv()

# Récupère l'URL de Neon depuis le fichier .env
# Par défaut, on laisse une chaîne vide pour forcer l'utilisation de la config
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("L'URL de la base de données (DATABASE_URL) n'est pas configurée dans le fichier .env")

# L'engine pour PostgreSQL. 
# Note : Pour Neon, l'URL DOIT se terminer par ?sslmode=require
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Session pour interagir avec la base
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe de base pour tes modèles (Etudiant, Professeur, etc.)
Base = declarative_base()

# Fonction (dépendance) pour obtenir la session de DB dans tes routes FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()