import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from .predict_note import set_model

BASE_DIR = os.path.dirname(__file__)
CSV_PATH = os.path.join(BASE_DIR, "train_dataset.csv")
MODEL_PATH = os.path.join(BASE_DIR, "note_model.pkl")

def update_model(data):
    if not os.path.exists(CSV_PATH):
        print(f"Erreur : {CSV_PATH} introuvable.")
        return

    new_data = pd.DataFrame([data])
    old_data = pd.read_csv(CSV_PATH)
    all_data = pd.concat([old_data, new_data], ignore_index=True)
    all_data.to_csv(CSV_PATH, index=False)

    X = all_data[[
        "comportement_moy",
        "participation_moy",
        "absence_pct",
        "devoirs_oubli_pct",
        "materiel_oubli_pct"
    ]]
    y = all_data["note_finale"]

    # n_estimators ajusté pour limiter la taille mémoire et le temps CPU
    model = RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        n_jobs=1
    )
    model.fit(X, y)

    joblib.dump(model, MODEL_PATH)
    set_model(model)
    print("Modèle réentraîné et synchronisé en RAM avec succès.")