from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import extract, and_
import pandas as pd
import io
from typing import Optional
import re
import json
import urllib.parse
import urllib.request
from deep_translator import MyMemoryTranslator

from database import get_db
from models.etudiant import Etudiant
from models.evaluation import Evaluation
from models.session import Session as SessionModel
from models.bilan_semestriels import BilanSemestriel
from models.professeur import Professeur
from .auth import get_current_user

router = APIRouter(prefix="/export", tags=["Exportation"])


# ---------- UTILS TRADUCTION ROBUSTE ----------

def traduire_texte(texte: str, src: str, dest: str) -> str:
    """Traduit via l'endpoint Google avec en-tête navigateur, et fallback sur MyMemory."""
    # Nettoyer les ponctuations combinées bizarres qui font échouer les traducteurs
    texte_clean = re.sub(r'[\.,;:\s]+', ' ', texte).strip()
    if not texte_clean:
        return texte

    # Tentative 1 : Google Translate direct avec User-Agent valide
    try:
        url = (
            "https://translate.googleapis.com/translate_a/single?client=gtx"
            f"&sl={src}&tl={dest}&dt=t&q=" + urllib.parse.quote(texte)
        )
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            res_json = json.loads(response.read().decode('utf-8'))
            traduction = "".join([partie[0] for partie in res_json[0] if partie[0]])
            if traduction:
                return traduction.strip()
    except Exception as e:
        print(f"Fallback vers MyMemory suite à : {e}")

    # Tentative 2 : MyMemory Translator (très robuste ar <-> fr)
    try:
        trad = MyMemoryTranslator(source=src, target=dest).translate(texte)
        if trad:
            return trad.strip()
    except Exception as e:
        print(f"Échec MyMemory : {e}")

    return texte


def harmoniser_remarque(texte: str, langue_cible: str) -> str:
    """Traduit automatiquement la remarque vers 'fr' ou 'ar' si la langue ne correspond pas."""
    if not texte or not str(texte).strip():
        return ""
    
    texte_str = str(texte).strip()
    contient_arabe = bool(re.search(r'[\u0600-\u06FF]', texte_str))
    
    # Si on veut du français mais le texte saisi est en arabe
    if langue_cible == "fr" and contient_arabe:
        return traduire_texte(texte_str, src="ar", dest="fr")
    
    # Si on veut de l'arabe mais le texte saisi est en français
    if langue_cible == "ar" and not contient_arabe:
        return traduire_texte(texte_str, src="fr", dest="ar")
        
    return texte_str


# ---------- EXPORT ABSENCES ----------

@router.get("/absences-excel/{classe_id}")
async def export_absences_excel(
    classe_id: int, 
    mois: Optional[int] = Query(None, ge=1, le=12), 
    langue: str = Query("fr", pattern="^(fr|ar)$"), 
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
            if status is True:
                row[col_name] = "P" if langue == "fr" else "ح"
            elif status is False:
                row[col_name] = "A" if langue == "fr" else "غ"
            else:
                row[col_name] = "-"
        data.append(row)

    df = pd.DataFrame(data)
    output = io.BytesIO()
    
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Presence')
        workbook = writer.book
        worksheet = writer.sheets['Presence']
        
        header_fmt = workbook.add_format({
            'bold': True, 
            'bg_color': '#3B82F6', 
            'font_color': 'white', 
            'border': 1, 
            'align': 'center'
        })
        cell_fmt = workbook.add_format({'border': 1, 'align': 'center'})

        if langue == "ar":
            worksheet.right_to_left()
        
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_fmt)
            worksheet.set_column(col_num, col_num, 15, cell_fmt)

    output.seek(0)
    return StreamingResponse(
        output, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


# ---------- EXPORT BILANS ----------

@router.get("/bilans-excel/{classe_id}")
async def export_bilans_excel(
    classe_id: int, 
    semestre: int,
    json: bool = False,
    langue: str = Query("fr", pattern="^(fr|ar)$"), 
    db: Session = Depends(get_db)
):
    resultats = db.query(BilanSemestriel, Etudiant).join(Etudiant).filter(
        BilanSemestriel.id_classe == classe_id,
        BilanSemestriel.semestre == semestre
    ).all()

    if not resultats:
        if json:
            return []
        raise HTTPException(status_code=404, detail="Aucun bilan trouvé")

    # SI JSON : Pour affichage / modification dans le frontend
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

    # SI EXCEL : Traduction et harmonisation des remarques
    data = []
    for bilan, etu in resultats:
        remarque_propre = harmoniser_remarque(bilan.remarque_finale, langue)
        data.append({
            "Code Massar": etu.code_massar,
            "Nom Complet": etu.nom_complet,
            "Note Finale": bilan.note_finale,
            "Remarque": remarque_propre
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

        header_format = workbook.add_format({
            'bold': True, 
            'bg_color': '#3B82F6', 
            'font_color': 'white', 
            'border': 1, 
            'align': 'center', 
            'valign': 'vcenter'
        })
        
        cell_format = workbook.add_format({
            'border': 1, 
            'align': 'center', 
            'valign': 'vcenter'
        })

        if langue == "ar":
            worksheet.right_to_left()

        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)
            width = 32 if any(k in str(value) for k in ["Nom", "الاسم", "Remarque", "ملاحظة"]) else 16
            worksheet.set_column(col_num, col_num, width, cell_format)

    output.seek(0)
    filename = f"bilans_S{semestre}_{langue}.xlsx"
    return StreamingResponse(
        output, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )