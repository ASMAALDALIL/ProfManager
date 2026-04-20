from predict_note import predict_note
from remark_ai import generate_remark


def tester_etudiant(data, titre):
    print(f"\n===== {titre} =====")

    note = predict_note(data)
    remarque = generate_remark(data, note)

    print("Données :", data)
    print("Note prédite :", note)
    print("Remarque :", remarque)


# TEST 1 : élève parfait
tester_etudiant({
    "comportement_moy": 5,
    "participation_moy": 5,
    "absence_pct": 0,
    "devoirs_oubli_pct": 0,
    "materiel_oubli_pct": 0
}, "TEST 1 - Élève parfait")


# TEST 2 : très bon élève avec légère absence
tester_etudiant({
    "comportement_moy": 5,
    "participation_moy": 4.5,
    "absence_pct": 0.1,
    "devoirs_oubli_pct": 0,
    "materiel_oubli_pct": 0
}, "TEST 2 - Très bon élève")


# TEST 3 : élève moyen
tester_etudiant({
    "comportement_moy": 3,
    "participation_moy": 3,
    "absence_pct": 0.2,
    "devoirs_oubli_pct": 0.2,
    "materiel_oubli_pct": 0.2
}, "TEST 3 - Élève moyen")


# TEST 4 : élève faible mais présent
tester_etudiant({
    "comportement_moy": 1,
    "participation_moy": 1,
    "absence_pct": 0.1,
    "devoirs_oubli_pct": 0.8,
    "materiel_oubli_pct": 0.8
}, "TEST 4 - Faible")


# TEST 5 : absent total
tester_etudiant({
    "comportement_moy": 0,
    "participation_moy": 0,
    "absence_pct": 1,
    "devoirs_oubli_pct": 0,
    "materiel_oubli_pct": 0
}, "TEST 5 - Absent total")


# TEST 6 : absent souvent mais bon en classe
tester_etudiant({
    "comportement_moy": 5,
    "participation_moy": 5,
    "absence_pct": 0.5,
    "devoirs_oubli_pct": 0,
    "materiel_oubli_pct": 0
}, "TEST 6 - Bon mais absent")


# TEST 7 : présent mais mauvais partout
tester_etudiant({
    "comportement_moy": 0,
    "participation_moy": 0,
    "absence_pct": 0,
    "devoirs_oubli_pct": 1,
    "materiel_oubli_pct": 1
}, "TEST 7 - Présent mais nul")


# TEST 8 : comportement ممتاز لكن participation ضعيفة
tester_etudiant({
    "comportement_moy": 5,
    "participation_moy": 1,
    "absence_pct": 0,
    "devoirs_oubli_pct": 0,
    "materiel_oubli_pct": 0
}, "TEST 8 - Comportement bon, participation faible")


# TEST 9 : participation ممتازة لكن comportement سيء
tester_etudiant({
    "comportement_moy": 1,
    "participation_moy": 5,
    "absence_pct": 0,
    "devoirs_oubli_pct": 0,
    "materiel_oubli_pct": 0
}, "TEST 9 - Participation bonne, comportement faible")


# TEST 10 : oublis fréquents
tester_etudiant({
    "comportement_moy": 4,
    "participation_moy": 4,
    "absence_pct": 0,
    "devoirs_oubli_pct": 0.9,
    "materiel_oubli_pct": 0.9
}, "TEST 10 - Trop d'oublis")