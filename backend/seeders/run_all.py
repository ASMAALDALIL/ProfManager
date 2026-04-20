from seeders.seed_cycles import seed_cycles
from seeders.seed_niveaux import seed_niveaux

def run_all():
    seed_cycles()
    seed_niveaux()
