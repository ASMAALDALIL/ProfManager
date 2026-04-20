from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.etudiant import Etudiant
from models.classe import Classe
from schemas.etudiant import EtudiantCreate, EtudiantUpdate, Etudiant as EtudiantSchema
from .auth import get_current_user
from models.professeur import Professeur

router = APIRouter(prefix="/etudiants", tags=["Étudiants"])

# --- GET ETUDIANTS PAR CLASSE ---
@router.get("/classe/{classe_id}", response_model=list[EtudiantSchema])
def get_etudiants_par_classe(
    classe_id: int, 
    db: Session = Depends(get_db), 
    current_user: Professeur = Depends(get_current_user)
):
    # Sécurité : On vérifie d'abord que la classe appartient bien au prof
    classe = db.query(Classe).filter(Classe.id == classe_id, Classe.professeur_id == current_user.id).first()
    if not classe:
        raise HTTPException(status_code=404, detail="Classe non trouvée ou accès refusé")
    
    # On filtre les étudiants par classe ET par professeur (par précaution)
    return db.query(Etudiant).filter(
        Etudiant.id_classe == classe_id,
        Etudiant.id_professeur == current_user.id
    ).all()

# --- CREATE ETUDIANT ---
@router.post("/", response_model=EtudiantSchema)
def create_etudiant(
    etudiant_data: EtudiantCreate, 
    db: Session = Depends(get_db), 
    current_user: Professeur = Depends(get_current_user)
):
    # Vérification d'unicité : Le code Massar existe-t-il DÉJÀ pour CE professeur ?
    existing = db.query(Etudiant).filter(
        Etudiant.code_massar == etudiant_data.code_massar,
        Etudiant.id_professeur == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Ce code Massar est déjà utilisé dans l'une de vos classes")

    # Création avec injection automatique de l'id_professeur courant
    new_etudiant = Etudiant(
        nom_complet=etudiant_data.nom_complet,
        code_massar=etudiant_data.code_massar,
        id_classe=etudiant_data.id_classe,
        id_professeur=current_user.id  # <--- Injection cruciale ici
    )
    
    db.add(new_etudiant)
    try:
        db.commit()
        db.refresh(new_etudiant)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erreur lors de l'enregistrement")
        
    return new_etudiant

# --- UPDATE ETUDIANT ---
@router.put("/{etudiant_id}", response_model=EtudiantSchema)
def update_etudiant(
    etudiant_id: int, 
    etudiant_update: EtudiantUpdate, 
    db: Session = Depends(get_db), 
    current_user: Professeur = Depends(get_current_user)
):
    # Sécurité : On ne peut modifier qu'un étudiant qui nous appartient
    db_etudiant = db.query(Etudiant).filter(
        Etudiant.id == etudiant_id,
        Etudiant.id_professeur == current_user.id
    ).first()
    
    if not db_etudiant:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé")

    for key, value in etudiant_update.dict(exclude_unset=True).items():
        setattr(db_etudiant, key, value)

    db.commit()
    db.refresh(db_etudiant)
    return db_etudiant

# --- DELETE ETUDIANT ---
@router.delete("/{etudiant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_etudiant(
    etudiant_id: int, 
    db: Session = Depends(get_db), 
    current_user: Professeur = Depends(get_current_user)
):
    db_etudiant = db.query(Etudiant).filter(
        Etudiant.id == etudiant_id,
        Etudiant.id_professeur == current_user.id
    ).first()
    
    if not db_etudiant:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé")
    
    db.delete(db_etudiant)
    db.commit()
    return None

# --- GET TOUS MES ETUDIANTS ---
@router.get("/tous", response_model=list[EtudiantSchema])
def get_tous_mes_etudiants(
    db: Session = Depends(get_db), 
    current_user: Professeur = Depends(get_current_user)
):
    # Simple et efficace : filtrage direct par id_professeur
    return db.query(Etudiant).filter(Etudiant.id_professeur == current_user.id).all()

# --- GET ETUDIANT PAR ID ---
@router.get("/{etudiant_id}", response_model=EtudiantSchema)
def get_etudiant_par_id(
    etudiant_id: int, 
    db: Session = Depends(get_db), 
    current_user: Professeur = Depends(get_current_user)
):
    etudiant = db.query(Etudiant).filter(
        Etudiant.id == etudiant_id,
        Etudiant.id_professeur == current_user.id
    ).first()
    
    if not etudiant:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé ou accès refusé")
        
    return etudiant