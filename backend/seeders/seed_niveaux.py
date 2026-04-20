from database import SessionLocal
from models.niveau import Niveau
from models.niveau_translation import NiveauTranslation
from models.cycle import Cycle

def seed_niveaux():
    db = SessionLocal()

    if db.query(Niveau).count() > 0:
        print("Niveaux déjà existants")
        return

    college = db.query(Cycle).filter(Cycle.code == "COLLEGE").first()
    lycee = db.query(Cycle).filter(Cycle.code == "LYCEE").first()

    niveaux = [
        ("1AC", college.id, "1ère année collège", "الأولى إعدادي"),
        ("2AC", college.id, "2ème année collège", "الثانية إعدادي"),
        ("3AC", college.id, "3ème année collège", "الثالثة إعدادي"),
        ("TC", lycee.id, "Tronc commun", "الجذع المشترك"),
        ("1BAC", lycee.id, "1ère Bac", "الأولى باك"),
        ("2BAC", lycee.id, "2ème Bac", "الثانية باك"),
    ]

    for code, cycle_id, fr, ar in niveaux:
        n = Niveau(code=code, cycle_id=cycle_id)
        db.add(n)
        db.commit()

        db.add_all([
            NiveauTranslation(niveau_id=n.id, lang="fr", label=fr),
            NiveauTranslation(niveau_id=n.id, lang="ar", label=ar),
        ])
        db.commit()

    db.close()
    print("Niveaux seeded ")
