from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as SQLSession
from database import get_db
from models.session import Session as SessionModel
from models.classe import Classe
from schemas.session import SessionCreate, SessionUpdate, Session as SessionSchema
from .auth import get_current_user
from models.professeur import Professeur

router = APIRouter(prefix="/sessions", tags=["Sessions de Cours"])

@router.post("/", response_model=SessionSchema)
def create_session(
    data: SessionCreate, 
    db: SQLSession = Depends(get_db), 
    current_user: Professeur = Depends(get_current_user)
):
    # Vérifier que la classe appartient au prof
    classe = db.query(Classe).filter(Classe.id == data.id_classe, Classe.professeur_id == current_user.id).first()
    if not classe:
        raise HTTPException(status_code=404, detail="Classe non trouvée ou accès refusé")

    new_session = SessionModel(**data.dict())
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.get("/classe/{classe_id}", response_model=list[SessionSchema])
def get_sessions_par_classe(
    classe_id: int, 
    db: SQLSession = Depends(get_db), 
    current_user: Professeur = Depends(get_current_user)
):
    classe = db.query(Classe).filter(Classe.id == classe_id, Classe.professeur_id == current_user.id).first()
    if not classe:
        raise HTTPException(status_code=404, detail="Classe non trouvée")
    
    return db.query(SessionModel).filter(SessionModel.id_classe == classe_id).all()

@router.put("/{session_id}", response_model=SessionSchema)
def update_session(
    session_id: int, 
    session_update: SessionUpdate, 
    db: SQLSession = Depends(get_db), 
    current_user: Professeur = Depends(get_current_user)
):
    db_session = db.query(SessionModel).join(Classe).filter(
        SessionModel.id == session_id, 
        Classe.professeur_id == current_user.id
    ).first()

    if not db_session:
        raise HTTPException(status_code=404, detail="Session non trouvée")

    for key, value in session_update.dict(exclude_unset=True).items():
        setattr(db_session, key, value)

    db.commit()
    db.refresh(db_session)
    return db_session

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: int, 
    db: SQLSession = Depends(get_db), 
    current_user: Professeur = Depends(get_current_user)
):
    db_session = db.query(SessionModel).join(Classe).filter(
        SessionModel.id == session_id, 
        Classe.professeur_id == current_user.id
    ).first()

    if not db_session:
        raise HTTPException(status_code=404, detail="Session non trouvée")

    db.delete(db_session)
    db.commit()
    return None

@router.get("/toutes", response_model=list[SessionSchema])
def get_toutes_mes_sessions(
    db: SQLSession = Depends(get_db), 
    current_user: Professeur = Depends(get_current_user)
):
    return db.query(SessionModel).join(Classe).filter(Classe.professeur_id == current_user.id).all()