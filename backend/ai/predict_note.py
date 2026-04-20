import os
import joblib
import pandas as pd
import gdown

# --- CONFIGURATION DES CHEMINS ---
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "note_model.pkl")

# ID de ton fichier sur Google Drive
FILE_ID = "1FRNbV6BMdF6OaqjD0szTG06RxdP0I1nl"

def load_model():
    """
    Télécharge le modèle depuis Google Drive s'il n'existe pas localement,
    puis le charge en mémoire.
    """
    if not os.path.exists(MODEL_PATH):
        print("--- Téléchargement du modèle via gdown (151 Mo)... ---")
        try:
            # Utilisation de gdown pour contourner la vérification antivirus de Google
            url = f'https://drive.google.com/uc?id={FILE_ID}'
            # gdown télécharge directement le fichier binaire au bon endroit
            gdown.download(url, MODEL_PATH, quiet=False)
            print("--- Téléchargement terminé avec succès ! ---")
        except Exception as e:
            print(f"--- Erreur lors du téléchargement avec gdown : {e} ---")
            return None
    
    try:
        # Chargement du modèle avec joblib
        return joblib.load(MODEL_PATH)
    except Exception as e:
        print(f"--- Erreur lors du chargement du fichier .pkl : {e} ---")
        return None

# --- INITIALISATION DU MODÈLE ---
model = load_model()

def predict_note(data):
    """
    Prend en entrée un dictionnaire de données et retourne la note prédite.
    """
    # Sécurité si le modèle n'a pas pu être chargé
    if model is None:
        return "Erreur : Modèle non disponible"

    # Logique métier : si trop d'absences, la note est 0
    if data["absence_pct"] >= 1:
        return 0.0

    # Création du DataFrame pour la prédiction (doit correspondre aux colonnes d'entraînement)
    df = pd.DataFrame([{
        "comportement_moy": data["comportement_moy"],
        "participation_moy": data["participation_moy"],
        "absence_pct": data["absence_pct"],
        "devoirs_oubli_pct": data["devoirs_oubli_pct"],
        "materiel_oubli_pct": data["materiel_oubli_pct"]
    }])

    # Prédiction
    try:
        note = model.predict(df)[0]
        # On contraint la note entre 0 et 20
        note = max(0, min(20, note))
        return round(note, 2)
    except Exception as e:
        print(f"--- Erreur lors de la prédiction : {e} ---")
        return "Erreur de calcul"
