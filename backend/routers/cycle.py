from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.cycle import Cycle
from models.cycle_translation import CycleTranslation
from schemas.cycle import CycleResponse

router = APIRouter(
    prefix="/cycles",
    tags=["Cycles"]
)

@router.get("/", response_model=list[CycleResponse])
def get_cycles(lang: str = "fr", db: Session = Depends(get_db)):
    return (
        db.query(Cycle.id, CycleTranslation.label)
        .join(CycleTranslation)
        .filter(CycleTranslation.lang == lang)
        .all()
    )
@router.get("/{cycle_id}")
def get_cycle_by_id(cycle_id: int, db: Session = Depends(get_db)):
    translations = db.query(CycleTranslation).filter(CycleTranslation.cycle_id == cycle_id).all()
    result = {"id": cycle_id}
    for t in translations:
        result[t.lang] = t.label
        
    return result