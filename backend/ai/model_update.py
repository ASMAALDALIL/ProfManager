import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor

BASE_DIR = os.path.dirname(__file__)
CSV_PATH = os.path.join(BASE_DIR, "train_dataset.csv")
MODEL_PATH = os.path.join(BASE_DIR, "note_model.pkl")


def update_model(data):
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

    model = RandomForestRegressor(
                n_estimators=200,
                random_state=42
            )

    model.fit(X, y)

    joblib.dump(model, MODEL_PATH)

    print("Modèle mis à jour avec succès.")