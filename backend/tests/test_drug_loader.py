import pytest
import os
from backend.services.drug_loader import load_drugs
from backend.core.models import Drug

def test_load_drugs_success():
    """Vérifie que le chargement des médicaments fonctionne avec les vraies données."""
    # Le chemin est relatif à la racine du projet ou absolu
    # Ici, on utilise le chemin relatif depuis la racine
    data_dir = "backend/data/raw"
    drugs = load_drugs(data_dir)
    
    # On vérifie qu'on a bien récupéré des médicaments
    assert len(drugs) > 0
    # On vérifie que le premier élément est bien un objet Drug
    assert isinstance(drugs[0], Drug)

def test_doliprane_content():
    """Vérifie spécifiquement si le Doliprane est bien chargé avec ses substances."""
    data_dir = "backend/data/raw"
    drugs = load_drugs(data_dir)
    
    # On cherche un Doliprane (en filtrant sur le nom)
    doliprane = next((d for d in drugs if "DOLIPRANE" in d.nom.upper()), None)
    
    assert doliprane is not None
    assert len(doliprane.substances) > 0
    
    # On vérifie qu'une des substances est bien le paracétamol
    # Note: On utilise upper() car les noms sont en majuscules dans la BDPM
    substances_nom = [s.nom.upper() for s in doliprane.substances]
    assert any("PARACÉTAMOL" in s for s in substances_nom)
