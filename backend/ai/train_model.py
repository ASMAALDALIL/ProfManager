import pandas as pd
import joblib
import os
from sklearn.ensemble import RandomForestRegressor

BASE_DIR = os.path.dirname(__file__)
CSV_PATH = os.path.join(BASE_DIR, "train_dataset.csv")
MODEL_PATH = os.path.join(BASE_DIR, "note_model.pkl")

df = pd.read_csv(CSV_PATH)

X = df[[
    "comportement_moy",
    "participation_moy",
    "absence_pct",
    "devoirs_oubli_pct",
    "materiel_oubli_pct"
]]

y = df["note_finale"]

model = RandomForestRegressor(
        n_estimators=200,
        random_state=42
    )

model.fit(X, y)

joblib.dump(model, MODEL_PATH)

print("Modèle entraîné avec succès.")