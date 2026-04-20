from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, Integer
from database import get_db
from models.evaluation import Evaluation
from models.etudiant import Etudiant
from models.session import Session as SessionModel
from schemas.evaluation import BulkEvalInput
from .auth import get_current_user
from schemas.evaluation import BulkEvalInput, StudentEvalInput

router = APIRouter(prefix="/evaluations", tags=["Évaluations"])

@router.post("/save-session")
def save_session_evaluations(data: BulkEvalInput, db: Session = Depends(get_db)):
    for item in data.evaluations:
        existing_eval = db.query(Evaluation).filter(
            Evaluation.id_session == data.id_session,
            Evaluation.id_etudiant == item.id_etudiant
        ).first()

        if existing_eval:
            for key, value in item.dict().items():
                setattr(existing_eval, key, value)
        else:
            new_eval = Evaluation(id_session=data.id_session, id_classe=data.id_classe, **item.dict())
            db.add(new_eval)
    db.commit()
    return {"message": "Enregistré"}

@router.get("/absences/classe/{classe_id}/mois/{mois}")
def get_absences_isolees(classe_id: int, mois: int, db: Session = Depends(get_db)):
    return db.query(Evaluation).join(SessionModel).filter(
        Evaluation.id_classe == classe_id,
        extract('month', SessionModel.date_session) == mois,
        Evaluation.absences == False
    ).all()

def get_bilan_semestre(etudiant_id: int, db: Session, semestre: int):
    # 1. Récupérer l'étudiant pour connaître sa classe
    etudiant = db.query(Etudiant).filter(Etudiant.id == etudiant_id).first()
    
    # 2. Calcul des stats (AVG ignore automatiquement les absences car pas de notes saisies)
    stats = db.query(
        func.avg(Evaluation.participation).label("participation_moyenne"),
        func.avg(Evaluation.comportement).label("comportement_moyenne"),
        func.sum(func.cast(Evaluation.absences, Integer)).label("total_presences"),
        func.sum(func.cast(Evaluation.organisation_oublis, Integer)).label("total_oublis"),
        func.sum(func.cast(Evaluation.devoirs_non_fait, Integer)).label("total_devoirs")
    ).join(SessionModel).filter(
        Evaluation.id_etudiant == etudiant_id,
        SessionModel.semestre == semestre
    ).first()

    # 3. Nombre total de sessions de SA classe pour ce semestre (pour le ratio d'absences)
    total_sessions_classe = db.query(SessionModel).filter(
        SessionModel.id_classe == etudiant.id_classe,
        SessionModel.semestre == semestre
    ).count()

    presences = stats.total_presences or 0
    
    return {
        "participation_moyenne": round(float(stats.participation_moyenne or 0), 2),
        "comportement_moyenne": round(float(stats.comportement_moyenne or 5), 2),
        "total_absences": max(0, total_sessions_classe - presences),
        "total_oublis_organisation": int(stats.total_oublis or 0),
        "total_devoirs_non_faits": int(stats.total_devoirs or 0)
    }
    
@router.get("/session/{session_id}")
def get_evaluations_by_session(session_id: int, db: Session = Depends(get_db)):
    return db.query(Evaluation).filter(Evaluation.id_session == session_id).all()

@router.get("/session/{session_id}/etudiant/{etudiant_id}")
def get_single_evaluation(session_id: int, etudiant_id: int, db: Session = Depends(get_db)):
    eval_data = db.query(Evaluation).filter(
        Evaluation.id_session == session_id,
        Evaluation.id_etudiant == etudiant_id
    ).first()
    
    if not eval_data:
        raise HTTPException(status_code=404, detail="Évaluation non trouvée")
    return eval_data

@router.put("/{evaluation_id}")
def update_single_evaluation(evaluation_id: int, item: StudentEvalInput, db: Session = Depends(get_db)):
    db_eval = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not db_eval:
        raise HTTPException(status_code=404, detail="Évaluation introuvable")

    db_eval.absences = item.absences
    db_eval.participation = item.participation
    db_eval.comportement = item.comportement
    db_eval.organisation_oublis = item.organisation_oublis
    db_eval.devoirs_non_fait = item.devoirs_non_fait

    db.commit()
    db.refresh(db_eval)
    return db_eval

@router.get("/etudiant/{etudiant_id}/historique")
def get_historique_etudiant(etudiant_id: int, db: Session = Depends(get_db)):
    # Jointure entre Evaluation et SessionModel pour avoir la date et l'heure
    results = db.query(Evaluation, SessionModel).join(
        SessionModel, Evaluation.id_session == SessionModel.id
    ).filter(Evaluation.id_etudiant == etudiant_id).all()
    
    historique = []
    for evaluation, session in results:
        historique.append({
            "date": session.date_session,
            "heure": session.heure_session,
            "absences": evaluation.absences,
            "participation": evaluation.participation,
            "comportement": evaluation.comportement,
            "organisation_oublis": evaluation.organisation_oublis,
            "devoirs_non_fait": evaluation.devoirs_non_fait
        })
    return historique