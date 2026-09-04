import os
import joblib
import pandas as pd
import gdown

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "note_model.pkl")
FILE_ID = "1FRNbV6BMdF6OaqjD0szTG06RxdP0I1nl"

_model = None

def load_model():
    global _model
    if not os.path.exists(MODEL_PATH):
        print("--- Téléchargement du modèle via gdown (151 Mo)... ---")
        try:
            url = f'https://drive.google.com/uc?id={FILE_ID}'
            gdown.download(url, MODEL_PATH, quiet=False)
            print("--- Téléchargement terminé avec succès ! ---")
        except Exception as e:
            print(f"--- Erreur gdown : {e} ---")
            return None
    
    try:
        _model = joblib.load(MODEL_PATH)
        print("--- Modèle IA chargé en RAM ---")
        return _model
    except Exception as e:
        print(f"--- Erreur joblib.load : {e} ---")
        return None

def set_model(new_model):
    global _model
    _model = new_model

# Chargement unique à l'import
_model = load_model()

def predict_note(data: dict):
    global _model
    if _model is None:
        _model = load_model()
        if _model is None:
            return 10.0  # Note de secours pour ne pas faire planter la route

    if data.get("absence_pct", 0) >= 1.0:
        return 0.0

    df = pd.DataFrame([{
        "comportement_moy": data["comportement_moy"],
        "participation_moy": data["participation_moy"],
        "absence_pct": data["absence_pct"],
        "devoirs_oubli_pct": data["devoirs_oubli_pct"],
        "materiel_oubli_pct": data["materiel_oubli_pct"]
    }])

    try:
        note = _model.predict(df)[0]
        return round(float(max(0.0, min(20.0, note))), 2)
    except Exception as e:
        print(f"--- Erreur prédiction : {e} ---")
        return 10.0