from fastapi import FastAPI, Query
from typing import List
from backend.services.search_service import SearchEngine
from backend.core.models import Drug
import os

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SafePills API",
    description="API pour l'analyse des interactions médicamenteuses",
    version="0.1.0"
)

# Configuration CORS pour permettre au Frontend (port 4321) de parler au Backend (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En développement, on peut être permissif
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialisation du moteur de recherche
# On utilise un chemin relatif vers les données
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
search_engine = SearchEngine(data_dir=DATA_DIR)

@app.get("/health")
async def health_check():
    """Vérifie que l'API est opérationnelle."""
    return {"status": "ok", "drugs_loaded": len(search_engine.drugs)}

@app.get("/api/search", response_model=List[Drug])
async def search_drugs(q: str = Query(..., min_length=1)):
    """
    Recherche des médicaments par nom ou substance.
    """
    return search_engine.search(q)
