import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "note_model.pkl")

model = joblib.load(MODEL_PATH)


def predict_note(data):
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