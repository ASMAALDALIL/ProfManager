from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_
import pandas as pd
import io
from database import get_db
from models.etudiant import Etudiant
from models.evaluation import Evaluation
from models.session import Session as SessionModel
from models.bilan_semestriels import BilanSemestriel
from .auth import get_current_user
from models.professeur import Professeur
from typing import Optional

router = APIRouter(prefix="/export", tags=["Exportation"])

# ---------- EXPORT ABSENCES ----------

@router.get("/absences-excel/{classe_id}")
async def export_absences_excel(
    classe_id: int, 
    mois: Optional[int] = Query(None, ge=1, le=12), 
    langue: str = Query("fr", regex="^(fr|ar)$"), 
    db: Session = Depends(get_db),
    current_user: Professeur = Depends(get_current_user)
):
    if not mois:
        raise HTTPException(status_code=400, detail="Veuillez sélectionner un mois")

    etudiants = db.query(Etudiant).filter(Etudiant.id_classe == classe_id).order_by(Etudiant.nom_complet).all()
    
    sessions = db.query(SessionModel).filter(
        and_(
            SessionModel.id_classe == classe_id,
            extract('month', SessionModel.date_session) == mois
        )
    ).order_by(SessionModel.date_session).all()

    session_ids = [s.id for s in sessions]
    evaluations = db.query(Evaluation).filter(Evaluation.id_session.in_(session_ids)).all()
    eval_map = {(e.id_etudiant, e.id_session): e.absences for e in evaluations}

    data = []
    for etu in etudiants:
        row = {
            "الاسم الكامل" if langue == "ar" else "Nom Complet": etu.nom_complet,
            "رقم مسار" if langue == "ar" else "Code Massar": etu.code_massar
        }
        for s in sessions:
            col_name = s.date_session.strftime("%d/%m")
            status = eval_map.get((etu.id, s.id))
            if status is True: row[col_name] = "P" if langue == "fr" else "ح"
            elif status is False: row[col_name] = "A" if langue == "fr" else "غ"
            else: row[col_name] = "-"
        data.append(row)

    df = pd.DataFrame(data)
    output = io.BytesIO()
    
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Presence')
        workbook = writer.book
        worksheet = writer.sheets['Presence']
        
        # Formatage Professionnel
        header_fmt = workbook.add_format({'bold': True, 'bg_color': '#3B82F6', 'font_color': 'white', 'border': 1, 'align': 'center'})
        cell_fmt = workbook.add_format({'border': 1, 'align': 'center'})

        if langue == "ar": worksheet.right_to_left()
        
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_fmt)
            worksheet.set_column(col_num, col_num, 15, cell_fmt)

    output.seek(0)
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

# ---------- EXPORT BILANS (CORRIGÉ AVEC ID ET DÉCORATION) ----------

@router.get("/bilans-excel/{classe_id}")
async def export_bilans_excel(
    classe_id: int, 
    semestre: int,
    json: bool = False,
    langue: str = Query("fr", regex="^(fr|ar)$"), 
    db: Session = Depends(get_db)
):
    resultats = db.query(BilanSemestriel, Etudiant).join(Etudiant).filter(
        BilanSemestriel.id_classe == classe_id,
        BilanSemestriel.semestre == semestre
    ).all()

    if not resultats:
        return [] if json else HTTPException(status_code=404, detail="Aucun bilan trouvé")

    # SI JSON : Pour le tableau React (IMPORTANT : Contient l'ID pour la modif)
    if json:
        return [
            {
                "id": bilan.id,
                "code_massar": etu.code_massar, 
                "nom_complet": etu.nom_complet, 
                "note_finale": bilan.note_finale, 
                "remarque_finale": bilan.remarque_finale
            } for bilan, etu in resultats
        ]

    # SI EXCEL : Construction pour téléchargement
    data = []
    for bilan, etu in resultats:
        data.append({
            "Code Massar": etu.code_massar,
            "Nom Complet": etu.nom_complet,
            "Note Finale": bilan.note_finale,
            "Remarque": bilan.remarque_finale
        })

    df = pd.DataFrame(data)
    if langue == "ar":
        df.columns = ["رقم مسار", "الاسم الكامل", "النقطة النهائية", "ملاحظة"]

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        sheet_name = f'Semestre {semestre}'
        df.to_excel(writer, index=False, sheet_name=sheet_name)
        
        workbook = writer.book
        worksheet = writer.sheets[sheet_name]

        # --- DÉCORATION ---
        header_format = workbook.add_format({
            'bold': True, 'bg_color': '#3B82F6', 'font_color': 'white',
            'border': 1, 'align': 'center', 'valign': 'vcenter'
        })
        
        cell_format = workbook.add_format({
            'border': 1, 'align': 'center', 'valign': 'vcenter'
        })

        if langue == "ar":
            worksheet.right_to_left()

        # Application du style aux entêtes et colonnes
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)
            # Colonnes plus larges pour les noms et remarques
            width = 30 if "Nom" in value or "الاسم" in value or "Remarque" in value or "ملاحظة" in value else 15
            worksheet.set_column(col_num, col_num, width, cell_format)

    output.seek(0)
    filename = f"bilans_S{semestre}.xlsx"
    return StreamingResponse(
        output, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )