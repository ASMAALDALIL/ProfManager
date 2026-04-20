from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.niveau import Niveau
from models.professeur import Professeur
from models.niveau_translation import NiveauTranslation
from schemas.niveau import NiveauResponse
from routers.auth import get_current_user

router = APIRouter(
    prefix="/niveaux",
    tags=["Niveaux"]
)

@router.get("/", response_model=list[NiveauResponse])
def get_niveaux(
    lang: str = "fr", 
    db: Session = Depends(get_db),
    current_user: Professeur = Depends(get_current_user)
):
    return (
        db.query(Niveau.id, NiveauTranslation.label, Niveau.cycle_id)
        .join(NiveauTranslation)
        .filter(NiveauTranslation.lang == lang)
        .all()
    )
