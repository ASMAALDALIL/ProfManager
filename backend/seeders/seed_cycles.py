from database import SessionLocal
from models.cycle import Cycle
from models.cycle_translation import CycleTranslation

def seed_cycles():
    db = SessionLocal()

    if db.query(Cycle).count() > 0:
        print("Cycles déjà existants")
        return

    college = Cycle(code="COLLEGE")
    lycee = Cycle(code="LYCEE")

    db.add_all([college, lycee])
    db.commit()

    db.add_all([
        CycleTranslation(cycle_id=college.id, lang="fr", label="Collège"),
        CycleTranslation(cycle_id=college.id, lang="ar", label="الإعدادي"),
        CycleTranslation(cycle_id=lycee.id, lang="fr", label="Lycée"),
        CycleTranslation(cycle_id=lycee.id, lang="ar", label="الثانوي"),
    ])

    db.commit()
    db.close()
    print("Cycles seeded ✔️")
