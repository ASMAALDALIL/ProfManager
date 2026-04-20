from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db

from models.bilan_semestriels import BilanSemestriel
from models.etudiant import Etudiant
from models.session import Session as SessionModel
from models.evaluation import Evaluation

from schemas.bilan import BilanUpdate
from .lang import get_lang

from ai.predict_note import predict_note
from ai.remark_ai import generate_remark
from ai.model_update import update_model

router = APIRouter(prefix="/bilans", tags=["Bilans & IA"])

def get_bilan_semestre(etudiant_id: int, db: Session, semestre: int, sessions_ids: list):
    """
    Calcule les statistiques d'un étudiant à partir des évaluations
    des sessions fournies. Retourne des comptes bruts et des moyennes.
    """
    if not sessions_ids:
        return None

    evaluations = (
        db.query(Evaluation)
        .filter(
            Evaluation.id_etudiant == etudiant_id,
            Evaluation.id_session.in_(sessions_ids)
        )
        .all()
    )

    if not evaluations:
        return None

    total_absences      = 0
    total_oublis_org    = 0   # matériel oublié (organisation_oublis)
    total_devoirs_nf    = 0   # devoirs non faits
    participation_sum   = 0
    comportement_sum    = 0
    present_count       = 0
    total_sessions      = len(sessions_ids)

    for ev in evaluations:
        # absences : True/1 = PRÉSENT dans le modèle de données
        # (le champ s'appelle "absences" mais vaut True quand l'élève EST présent)
        est_present = bool(ev.absences)

        if est_present:
            participation_sum += (ev.participation or 0)
            comportement_sum  += (ev.comportement  or 0)
            present_count     += 1
        else:
            total_absences += 1

        # matériel oublié — supporte les deux noms de colonne possibles
        if getattr(ev, "organisation_oublis", False) or getattr(ev, "materiel_oubli", False):
            total_oublis_org += 1

        # devoirs non faits — supporte les deux noms de colonne possibles
        if getattr(ev, "devoirs_non_fait", False) or getattr(ev, "devoir_non_fait", False):
            total_devoirs_nf += 1

    return {
        # comptes bruts (utiles pour les logs / apprentissage)
        "absences"          : total_absences,
        "devoirs_non_faits" : total_devoirs_nf,
        "organisation_oublis": total_oublis_org,
        "present_count"     : present_count,
        "total_sessions"    : total_sessions,
        # moyennes (sur les séances où l'élève était présent)
        "comportement_moy"  : round(comportement_sum  / present_count, 2) if present_count > 0 else 0.0,
        "participation_moy" : round(participation_sum / present_count, 2) if present_count > 0 else 0.0,
    }


def build_ia_features(stats: dict) -> dict:
    """
    Transforme les comptes bruts en pourcentages pour le modèle.
    Noms exacts attendus par predict_note() et model_update() :
        comportement_moy  (0-5)
        participation_moy (0-5)
        absence_pct       (0.0-1.0)
        devoirs_oubli_pct (0.0-1.0)
        materiel_oubli_pct(0.0-1.0)
    """
    total   = stats["total_sessions"]
    present = stats["present_count"]

    # évite la division par zéro
    safe_total   = total   if total   > 0 else 1
    safe_present = present if present > 0 else 1

    absence_pct        = stats["absences"]           / safe_total
    devoirs_oubli_pct  = stats["devoirs_non_faits"]  / safe_present
    materiel_oubli_pct = stats["organisation_oublis"] / safe_present

    return {
        "comportement_moy"  : stats["comportement_moy"],
        "participation_moy" : stats["participation_moy"],
        "absence_pct"       : round(min(absence_pct,        1.0), 4),
        "devoirs_oubli_pct" : round(min(devoirs_oubli_pct,  1.0), 4),
        "materiel_oubli_pct": round(min(materiel_oubli_pct, 1.0), 4),
    }


@router.post("/generer-classe/{classe_id}")
async def generer_bilans_classe(
    classe_id: int,
    semestre: int,
    db: Session = Depends(get_db),
    lang: str = Depends(get_lang),
):
    # 1. Étudiants de la classe
    etudiants = db.query(Etudiant).filter(Etudiant.id_classe == classe_id).all()
    if not etudiants:
        raise HTTPException(status_code=404, detail="Aucun étudiant trouvé dans cette classe")

    # 2. Sessions du semestre (avec fallback sans filtre semestre)
    sessions = db.query(SessionModel).filter(
        SessionModel.id_classe == classe_id,
        SessionModel.semestre  == semestre,
    ).all()

    if not sessions:
        sessions = db.query(SessionModel).filter(
            SessionModel.id_classe == classe_id
        ).all()

    if not sessions:
        raise HTTPException(
            status_code=400,
            detail="Aucune séance enregistrée pour cette classe",
        )

    session_ids          = [s.id for s in sessions]
    bilans_crees         = 0
    bilans_mis_a_jour    = 0

    for etu in etudiants:
        # ── Stats brutes ──────────────────────────────────
        stats = get_bilan_semestre(etu.id, db, semestre, session_ids)
        if not stats:
            continue   # aucune évaluation pour cet étudiant → on saute

        # ── Conversion en features IA ────────────────────
        features = build_ia_features(stats)

        # ── Prédiction ───────────────────────────────────
        note_ia     = float(predict_note(features))
        remarque_ia = generate_remark(features, note_ia, lang=lang)

        # ── Sauvegarde en base ───────────────────────────
        existant = db.query(BilanSemestriel).filter(
            BilanSemestriel.id_etudiant == etu.id,
            BilanSemestriel.semestre    == semestre,
        ).first()

        if existant:
            existant.note_ia      = note_ia
            existant.remarque_ia  = remarque_ia
            # on ne touche pas à la note finale si le prof l'a déjà modifiée
            if existant.a_ete_modifie == 0:
                existant.note_finale     = note_ia
                existant.remarque_finale = remarque_ia
            bilans_mis_a_jour += 1
        else:
            db.add(BilanSemestriel(
                id_etudiant      = etu.id,
                id_classe        = classe_id,
                semestre         = semestre,
                note_ia          = note_ia,
                remarque_ia      = remarque_ia,
                note_finale      = note_ia,
                remarque_finale  = remarque_ia,
                a_ete_modifie    = 0,
            ))
            bilans_crees += 1

    db.commit()

    return {
        "status" : "success",
        "message": f"Traitement terminé : {bilans_crees} créés, {bilans_mis_a_jour} mis à jour.",
        "details": {"created": bilans_crees, "updated": bilans_mis_a_jour},
    }


# ==========================================================
# PUT /bilans/modifier/{bilan_id}
# Mise à jour manuelle + réentraînement du modèle
# ==========================================================
@router.put("/modifier/{bilan_id}")
async def modifier_et_apprendre(
    bilan_id: int,
    obj_in: BilanUpdate,
    db: Session = Depends(get_db),
):
    bilan = db.query(BilanSemestriel).filter(BilanSemestriel.id == bilan_id).first()
    if not bilan:
        raise HTTPException(status_code=404, detail="Bilan introuvable")

    # ── Mise à jour manuelle ─────────────────────────────
    bilan.note_finale      = obj_in.note_finale
    bilan.remarque_finale  = obj_in.remarque_finale
    bilan.a_ete_modifie    = 1

    # ── Réentraînement IA ────────────────────────────────
    sessions = db.query(SessionModel).filter(
        SessionModel.id_classe == bilan.id_classe,
        SessionModel.semestre  == bilan.semestre,
    ).all()

    session_ids = [s.id for s in sessions]
    stats = get_bilan_semestre(bilan.id_etudiant, db, bilan.semestre, session_ids)

    if stats and session_ids:
        features = build_ia_features(stats)

        # Le CSV d'entraînement attend les colonnes :
        #   comportement_moy | participation_moy | absence_pct |
        #   devoirs_oubli_pct | materiel_oubli_pct | note_finale
        update_data = {
            **features,                         # toutes les features déjà bien nommées
            "note_finale": obj_in.note_finale,  # cible d'apprentissage (nom exact du CSV)
        }
        update_model(update_data)

    db.commit()
    return {"message": "Bilan mis à jour et modèle IA réentraîné avec succès"}