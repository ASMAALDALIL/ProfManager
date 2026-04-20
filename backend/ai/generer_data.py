import csv

def compute_note(c, p, a, d, m):
    # غياب كلي = 0
    if a >= 1:
        return 0

    note = (
        (c / 5) * 3 +          # comportement
        (p / 5) * 3 +          # participation
        (1 - a) * 8 +          # absences أهم عامل
        (1 - d) * 3 +          # devoirs
        (1 - m) * 3            # matériel
    )

    # عقوبات إضافية إذا comportement / participation ضعيفين بزاف
    if c < 2:
        note -= 2

    if p < 2:
        note -= 2

    # عقوبة إضافية إذا oubli بزاف
    if d > 0.7:
        note -= 1

    if m > 0.7:
        note -= 1

    return round(max(0, min(20, note)), 2)

with open("train_dataset.csv", mode="w", newline="") as file:
    writer = csv.writer(file)

    writer.writerow([
        "comportement_moy",
        "participation_moy",
        "absence_pct",
        "devoirs_oubli_pct",
        "materiel_oubli_pct",
        "note_finale"
    ])

    # génération structurée (مش random عشوائي)
    for c in [0,1,2,3,4,5]:
        for p in [0,1,2,3,4,5]:
            for a in [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]:
                for d in [0,0.25,0.5,0.75,1]:
                    for m in [0,0.25,0.5,0.75,1]:

                        # règle: absent total
                        if a == 1:
                            c2, p2, d2, m2 = 0,0,0,0
                        else:
                            c2, p2, d2, m2 = c,p,d,m

                        note = compute_note(c2,p2,a,d2,m2)

                        writer.writerow([c2,p2,a,d2,m2,note])

print("Dataset généré avec succès !")