import pandas as pd


def prepare_features(data: dict):
    """
    Transforme les données brutes d'un étudiant
    en DataFrame prêt pour le modèle.
    """
    return pd.DataFrame([{
        "absences": data["absences"],
        "devoirs_non_faits": data["devoirs_non_faits"],
        "organisation_oublis": data["organisation_oublis"],
        "comportement_moy": data["comportement_moy"],
        "participation_moy": data["participation_moy"],
        "nombre_seances": data["nombre_seances"]
    }])