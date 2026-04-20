from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
import pandas as pd
import io
from typing import Optional
from difflib import SequenceMatcher
import re

# Imports locaux
from database import get_db
from models.classe import Classe
from models.etudiant import Etudiant
from models.professeur import Professeur
from schemas.classe import Classe as ClasseSchema
from .auth import get_current_user
from .lang import get_lang

router = APIRouter(prefix="/classes", tags=["Classes"])


@router.get("/", response_model=list[ClasseSchema])
def get_my_classes(
    db: Session = Depends(get_db),
    current_user: Professeur = Depends(get_current_user)
):
    return db.query(Classe).filter(Classe.professeur_id == current_user.id).all()


# ---------- UTILS ----------

def normalize(text):
    if text is None:
        return ""
    text = str(text).lower()
    text = text.replace("_", "").replace(" ", "")
    return text


def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()


def find_best_column(columns, keywords):
    best_col = None
    best_score = 0
    for col in columns:
        col_norm = normalize(col)
        for key in keywords:
            score = similar(col_norm, normalize(key))
            if score > best_score:
                best_score = score
                best_col = col
    if best_score > 0.6:
        return best_col
    return None


# ---------- CREATE CLASSE ----------

@router.post("/", response_model=ClasseSchema)
async def create_classe(
    nom: str = Form(...),
    niveau_id: int = Form(...),
    cycle_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Professeur = Depends(get_current_user),
    lang: str = Depends(get_lang)
):
    if not file.filename.endswith((".xls", ".xlsx")):
        raise HTTPException(status_code=400, detail="Fichier Excel requis")

    new_classe = Classe(
        nom=nom,
        niveau_id=niveau_id,
        cycle_id=cycle_id,
        professeur_id=current_user.id
    )

    db.add(new_classe)
    db.commit()
    db.refresh(new_classe)

    try:
        contents = await file.read()
        df_raw = pd.read_excel(io.BytesIO(contents), header=None)

        header_row = None
        nom_keywords = ["nom complet", "nom_complet", "nom", "الاسم الكامل", "اسم التلميذ", "إسم التلميذ"]
        massar_keywords = ["code massar", "code_massar", "massar", "رقم مسار", "رقم التلميذ"]

        # Détecter ligne header
        for i, row in df_raw.iterrows():
            values = [normalize(v) for v in row.values]
            if any(similar(v, normalize(k)) > 0.6 for v in values for k in nom_keywords + massar_keywords):
                header_row = i
                break

        if header_row is None:
            raise Exception("Impossible de détecter les colonnes de l'entête dans le fichier Excel")

        df = pd.read_excel(io.BytesIO(contents), header=header_row)
        df.columns = [str(c).strip() for c in df.columns]

        col_nom = find_best_column(df.columns, nom_keywords)
        col_massar = find_best_column(df.columns, massar_keywords)

        if not col_nom or not col_massar:
            raise Exception(f"Colonnes introuvables. Détectées: {list(df.columns)}")

        etudiants = []
        for _, row in df.iterrows():
            nom_etudiant = str(row[col_nom]).strip()
            massar = str(row[col_massar]).strip()

            if nom_etudiant and nom_etudiant.lower() != "nan":
                # Validation format Massar (1 lettre + 9 chiffres)
                if not re.match(r"[A-Za-z][0-9]{9}", massar):
                    continue

                etudiants.append(
                    Etudiant(
                        nom_complet=nom_etudiant,
                        code_massar=massar,
                        id_classe=new_classe.id,
                        id_professeur=current_user.id  # <--- INJECTION DE L'ID PROFESSEUR
                    )
                )

        db.add_all(etudiants)
        db.commit()
        return new_classe

    except Exception as e:
        db.rollback()
        db.delete(new_classe) # Supprime la classe si l'importation échoue
        db.commit()
        msg = f"Erreur : {str(e)}" if lang == "fr" else f"خطأ : {str(e)}"
        raise HTTPException(status_code=400, detail=msg)


# ---------- UPDATE CLASSE ----------

@router.put("/{classe_id}", response_model=ClasseSchema)
async def update_classe(
    classe_id: int,
    nom: Optional[str] = Form(None),
    niveau_id: Optional[int] = Form(None),
    cycle_id: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: Professeur = Depends(get_current_user),
    lang: str = Depends(get_lang)
):
    db_classe = db.query(Classe).filter(
        Classe.id == classe_id,
        Classe.professeur_id == current_user.id
    ).first()

    if not db_classe:
        raise HTTPException(status_code=404, detail="Classe non trouvée")

    if nom: db_classe.nom = nom
    if niveau_id: db_classe.niveau_id = niveau_id
    if cycle_id: db_classe.cycle_id = cycle_id

    if file:
        try:
            contents = await file.read()
            df_raw = pd.read_excel(io.BytesIO(contents), header=None)

            header_row = None
            nom_keywords = ["nom complet", "nom_complet", "nom", "الاسم الكامل", "اسم التلميذ"]
            massar_keywords = ["code massar", "code_massar", "massar", "رقم مسار"]

            for i, row in df_raw.iterrows():
                values = [normalize(v) for v in row.values]
                if any(similar(v, normalize(k)) > 0.6 for v in values for k in nom_keywords + massar_keywords):
                    header_row = i
                    break

            if header_row is None: raise Exception("Entête Excel introuvable")

            df = pd.read_excel(io.BytesIO(contents), header=header_row)
            df.columns = [str(c).strip() for c in df.columns]
            col_nom = find_best_column(df.columns, nom_keywords)
            col_massar = find_best_column(df.columns, massar_keywords)

            if not col_nom or not col_massar: raise Exception("Colonnes manquantes")

            # Supprimer SEULEMENT les étudiants du professeur actuel pour cette classe
            db.query(Etudiant).filter(
                Etudiant.id_classe == classe_id,
                Etudiant.id_professeur == current_user.id
            ).delete()

            etudiants = []
            for _, row in df.iterrows():
                nom_etu = str(row[col_nom]).strip()
                massar_etu = str(row[col_massar]).strip()

                if nom_etu and nom_etu.lower() != "nan":
                    if not re.match(r"[A-Za-z][0-9]{9}", massar_etu): continue

                    etudiants.append(
                        Etudiant(
                            nom_complet=nom_etu,
                            code_massar=massar_etu,
                            id_classe=classe_id,
                            id_professeur=current_user.id # <--- INJECTION DE L'ID PROFESSEUR
                        )
                    )
            db.add_all(etudiants)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Erreur import : {str(e)}")

    db.commit()
    db.refresh(db_classe)
    return db_classe


# ---------- DELETE CLASSE ----------

@router.delete("/{classe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_classe(
    classe_id: int,
    db: Session = Depends(get_db),
    current_user: Professeur = Depends(get_current_user)
):
    classe = db.query(Classe).filter(
        Classe.id == classe_id,
        Classe.professeur_id == current_user.id
    ).first()

    if not classe:
        raise HTTPException(status_code=404, detail="Classe non trouvée")

    # Supprime les étudiants liés à cette classe pour ce prof
    db.query(Etudiant).filter(
        Etudiant.id_classe == classe_id,
        Etudiant.id_professeur == current_user.id
    ).delete()
    
    db.delete(classe)
    db.commit()
    return None

@router.get("/{classe_id}", response_model=ClasseSchema)
def get_classe_detail(
    classe_id: int, 
    db: Session = Depends(get_db), 
    current_user: Professeur = Depends(get_current_user)
):
    classe = db.query(Classe).filter(
        Classe.id == classe_id, 
        Classe.professeur_id == current_user.id
    ).first()
    
    if not classe:
        raise HTTPException(status_code=404, detail="Classe non trouvée")
    return classe