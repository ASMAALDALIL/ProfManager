from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from seeders.run_all import run_all

# Import de tous les modèles pour la synchronisation DB
from models.cycle import Cycle
from models.cycle_translation import CycleTranslation
from models.niveau import Niveau
from models.niveau_translation import NiveauTranslation
from models.classe import Classe
from models.professeur import Professeur
from models.etudiant import Etudiant
from models.session import Session
from models.evaluation import Evaluation
from models.bilan_semestriels import BilanSemestriel

from routers import (
    cycle, niveau, auth, classe, 
    etudiant, professeur, evaluation, 
    bilan_ia, export, session
)

# Création des tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ProfManager API",
    description="Système bilingue de gestion scolaire avec IA prédictive",
    version="1.5.0"
)

# CONFIGURATION CORS (Indispensable pour le bilingue et le Front)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://profmanager-8afd3.web.app"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTERS EXISTANTS
app.include_router(auth.router)
app.include_router(cycle.router)
app.include_router(niveau.router)
app.include_router(classe.router)
app.include_router(etudiant.router)
app.include_router(professeur.router)
app.include_router(session.router)
# NOUVEAUX ROUTERS AJOUTÉS
app.include_router(evaluation.router)
app.include_router(bilan_ia.router)
app.include_router(export.router)

# AUTO SEEDERS
@app.on_event("startup")
def startup():
    run_all()

@app.get("/")
def home():
    return {"status": "Online", "mode": "Bilingual (FR/AR)", "features": ["AI Prediction", "Continuous Learning"]}