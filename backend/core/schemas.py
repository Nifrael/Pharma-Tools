"""
Schemas Pydantic (DTO)
Ce sont les objets qui transitent via l'API (Entrées/Sorties),
mais qui ne sont PAS stockés tels quels en base de données.
"""
from pydantic import BaseModel
from typing import List, Optional
from .models import RiskLevel

class SearchResult(BaseModel):
    """Ce que le moteur de recherche renvoie à l'UI"""
    type: str         # "drug" ou "substance"
    id: str           # CIS ou Code Substance
    name: str
    description: Optional[str] = None

class EvaluationResponse(BaseModel):
    """Résultat du calcul/algorithme d'analyse"""
    score: RiskLevel  # Utilisation de l'Enum
    details: List[str] # Messages explicatifs générés dynamiquement
