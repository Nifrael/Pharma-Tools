from pydantic import BaseModel
from typing import List, Optional

class Substance(BaseModel):
    """
    Représente une substance active contenue dans un médicament.
    Exemple: Paracétamol
    """
    code_substance: str
    nom: str
    dosage: str

class Drug(BaseModel):
    """
    Représente un médicament simplifié pour la recherche et les interactions.
    """
    cis: str
    nom: str
    substances: List[Substance] = []
