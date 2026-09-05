from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import extract, and_
import pandas as pd
import io
from typing import Optional
import re
import json as json_lib
import urllib.parse
import urllib.request
import ssl
from deep_translator import GoogleTranslator

from database import get_db
from models.etudiant import Etudiant
from models.evaluation import Evaluation
from models.session import Session as SessionModel
from models.bilan_semestriels import BilanSemestriel
from models.professeur import Professeur
from .auth import get_current_user

router = APIRouter(prefix="/export", tags=["Exportation"])

# ---------- GLOSSAIRE PÉDAGOGIQUE DIRECT (FR <-> AR) ----------
GLOSSAIRE_FR_TO_AR = {
    "résultats moyens": "نتائج متوسطة",
    "résultats très faibles": "نتائج ضعيفة جداً",
    "résultats faibles": "نتائج ضعيفة",
    "résultats satisfaisants": "نتائج مرضية",
    "très bon travail": "عمل ممتاز",
    "bon travail": "عمل جيد",
    "travail acceptable": "عمل مقبول",
    "dans l'ensemble": "بشكل عام",
    "toutefois": "لكن",
    "cependant": "مع ذلك",
    "mais": "لكن",
    "participation très faible": "مشاركة ضعيفة جداً",
    "participation faible": "مشاركة ضعيفة",
    "participation moyenne": "مشاركة متوسطة",
    "bonne participation": "مشاركة جيدة",
    "participation active": "مشاركة فعالة",
    "manque de concentration": "نقص في التركيز",
    "manque d'organisation": "نقص في التنظيم",
    "devoirs non faits": "الواجبات غير منجزة",
    "devoirs souvent non faits": "الواجبات غالباً غير منجزة",
    "le comportement nécessite une amélioration": "السلوك يحتاج إلى تحسين",
    "doit faire plus d'efforts": "يجب بذل المزيد من الجهد",
}

def traduire_par_glossaire(texte: str, dest: str) -> str:
    resultat = texte
    if dest == "ar":
        for fr_expr, ar_expr in GLOSSAIRE_FR_TO_AR.items():
            pattern = re.compile(re.escape(fr_expr), re.IGNORECASE)
            resultat = pattern.sub(ar_expr, resultat)
    else:
        for fr_expr, ar_expr in GLOSSAIRE_FR_TO_AR.items():
            pattern = re.compile(re.escape(ar_expr), re.IGNORECASE)
            resultat = pattern.sub(fr_expr, resultat)
    return resultat

def traduire_texte(texte: str, src: str, dest: str) -> str:
    if not texte or not texte.strip():
        return texte

    # 1. Remplacement rapide via glossaire
    texte_glossaire = traduire_par_glossaire(texte, dest)
    contient_arabe = bool(re.search(r'[\u0600-\u06FF]', texte_glossaire))
    if dest == "ar" and contient_arabe and not re.search(r'[a-zA-Z]{4,}', texte_glossaire):
        return texte_glossaire
    if dest == "fr" and not contient_arabe:
        return texte_glossaire

    # 2. Utilisation de deep_translator
    try:
        trad = GoogleTranslator(source=src, target=dest).translate(texte)
        if trad and trad.strip():
            return trad.strip()
    except Exception as e:
        print(f"Échec deep-translator : {e}")

    # 3. Requête directe Google Translate avec SSL bypass
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        url = (
            "https://translate.googleapis.com/translate_a/single?client=gtx"
            f"&sl={src}&tl={dest}&dt=t&q=" + urllib.parse.quote(texte)
        )
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4, context=ctx) as response:
            res_json = json_lib.loads(response.read().decode('utf-8'))
            traduction = "".join([partie[0] for partie in res_json[0] if partie[0]])
            if traduction:
                return traduction.strip()
    except Exception as e:
        print(f"Échec Google direct : {e}")

    return texte_glossaire

def harmoniser_remarque(texte: str, langue_cible: str) -> str:
    if not texte or not str(texte).strip():
        return ""
    
    texte_str = str(texte).strip()
    contient_arabe = bool(re.search(r'[\u0600-\u06FF]', texte_str))
    lang_cible = "ar" if str(langue_cible).lower().startswith("ar") else "fr"
    
    if lang_cible == "fr" and contient_arabe:
        return traduire_texte(texte_str, src="ar", dest="fr")
    
    if lang_cible == "ar" and not contient_arabe:
        return traduire_texte(texte_str, src="fr", dest="ar")
        
    return texte_str


# ---------- EXPORT ABSENCES ----------

@router.get("/absences-excel/{classe_id}")
async def export_absences_excel(
    classe_id: int, 
    mois: Optional[int] = Query(None, ge=1, le=12), 
    langue: str = Query("fr"), 
    db: Session = Depends(get_db),
    current_user: Professeur = Depends(get_current_user)
):
    clean_lang = "ar" if langue.lower().startswith("ar") else "fr"

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
            "الاسم الكامل" if clean_lang == "ar" else "Nom Complet": etu.nom_complet,
            "رقم مسار" if clean_lang == "ar" else "Code Massar": etu.code_massar
        }
        for s in sessions:
            col_name = s.date_session.strftime("%d/%m")
            status = eval_map.get((etu.id, s.id))
            if status is True:
                row[col_name] = "P" if clean_lang == "fr" else "ح"
            elif status is False:
                row[col_name] = "A" if clean_lang == "fr" else "غ"
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

        if clean_lang == "ar":
            worksheet.right_to_left()
        
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_fmt)
            worksheet.set_column(col_num, col_num, 15, cell_fmt)

    output.seek(0)
    return StreamingResponse(
        output, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


# ---------- EXPORT / FETCH BILANS ----------

@router.get("/bilans-excel/{classe_id}")
async def export_bilans_excel(
    classe_id: int, 
    semestre: int = Query(1),
    json: Optional[str] = Query(None),
    langue: str = Query("fr"), 
    db: Session = Depends(get_db)
):
    clean_lang = "ar" if langue.lower().startswith("ar") else "fr"
    is_json = json is not None and str(json).lower() in ["true", "1", "yes"]

    resultats = db.query(BilanSemestriel, Etudiant).join(Etudiant).filter(
        BilanSemestriel.id_classe == classe_id,
        BilanSemestriel.semestre == semestre
    ).all()

    # Si demandé en JSON pour le calculateur dans React : renvoyer [] si vide sans planter
    if is_json:
        if not resultats:
            return []
        return [
            {
                "id": bilan.id,
                "code_massar": etu.code_massar, 
                "nom_complet": etu.nom_complet, 
                "note_finale": bilan.note_finale, 
                "remarque_finale": bilan.remarque_finale
            } for bilan, etu in resultats
        ]

    # Si export Excel et qu'aucun bilan n'existe
    if not resultats:
        raise HTTPException(status_code=404, detail="Aucun bilan trouvé pour ce semestre")

    # Génération du fichier Excel
    data = []
    for bilan, etu in resultats:
        remarque_propre = harmoniser_remarque(bilan.remarque_finale, clean_lang)
        data.append({
            "Code Massar": etu.code_massar,
            "Nom Complet": etu.nom_complet,
            "Note Finale": bilan.note_finale,
            "Remarque": remarque_propre
        })

    df = pd.DataFrame(data)
    if clean_lang == "ar":
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

        if clean_lang == "ar":
            worksheet.right_to_left()

        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)
            width = 32 if any(k in str(value) for k in ["Nom", "الاسم", "Remarque", "ملاحظة"]) else 16
            worksheet.set_column(col_num, col_num, width, cell_format)

    output.seek(0)
    filename = f"bilans_S{semestre}_{clean_lang}.xlsx"
    return StreamingResponse(
        output, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )