import os
import joblib
import pandas as pd
import urllib.request

# --- CONFIGURATION DU TÉLÉCHARGEMENT ---
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "note_model.pkl")
# Ton lien direct Google Drive
MODEL_URL = "https://drive.google.com/uc?export=download&id=1FRNbV6BMdF6OaqjD0szTG06RxdP0I1nl"

def load_model():
    # Si le fichier n'est pas sur le serveur (cas de Render)
    if not os.path.exists(MODEL_PATH):
        print("--- Modèle IA introuvable. Téléchargement depuis Google Drive... ---")
        try:
            # On définit un User-Agent pour éviter d'être bloqué par Google
            opener = urllib.request.build_opener()
            opener.addheaders = [('User-agent', 'Mozilla/5.0')]
            urllib.request.install_opener(opener)
            
            urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
            print("--- Téléchargement terminé avec succès ! ---")
        except Exception as e:
            print(f"--- Erreur critique de téléchargement : {e} ---")
            # On retourne None pour éviter de faire planter tout le serveur au démarrage
            return None
    
    return joblib.load(MODEL_PATH)

# --- CHARGEMENT DU MODÈLE ---
model = load_model()

def predict_note(data):
    # Sécurité au cas où le modèle n'a pas pu être chargé
    if model is None:
        return "Erreur : Modèle non chargé"

    if data["absence_pct"] >= 1:
        return 0.0

    df = pd.DataFrame([{
        "comportement_moy": data["comportement_moy"],
        "participation_moy": data["participation_moy"],
        "absence_pct": data["absence_pct"],
        "devoirs_oubli_pct": data["devoirs_oubli_pct"],
        "materiel_oubli_pct": data["materiel_oubli_pct"]
    }])

    note = model.predict(df)[0]
    note = max(0, min(20, note))

    return round(note, 2)
