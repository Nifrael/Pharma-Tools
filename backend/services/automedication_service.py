"""
Service de gestion des questions d'automédication.
Logique métier pour récupérer les questions adaptées à une molécule.
"""

import sqlite3
from typing import List, Dict, Optional
from ..core.config import DB_PATH


class AutomedicationQuestion:
    """Modèle représentant une question d'automédication"""
    def __init__(
        self,
        id: str,
        text_fr: str,
        text_es: str,
        trigger_tags: List[str],
        risk_if_yes: str,
        priority: int,
        explanation_fr: Optional[str] = None,
        explanation_es: Optional[str] = None
    ):
        self.id = id
        self.text_fr = text_fr
        self.text_es = text_es
        self.trigger_tags = trigger_tags
        self.risk_if_yes = risk_if_yes  # "GREEN", "ORANGE", "RED"
        self.priority = priority
        self.explanation_fr = explanation_fr
        self.explanation_es = explanation_es

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "text_fr": self.text_fr,
            "text_es": self.text_es,
            "trigger_tags": self.trigger_tags,
            "risk_if_yes": self.risk_if_yes,
            "priority": self.priority,
            "explanation_fr": self.explanation_fr,
            "explanation_es": self.explanation_es
        }


def get_substance_tags(substance_code: str) -> List[str]:
    """
    Récupère les tags associés à une substance depuis la base de données.
    
    Args:
        substance_code: Code de la substance (code_sub)
    
    Returns:
        Liste des tags (ex: ["ains", "grossesse_ci", "hepatotoxique"])
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT tags FROM substances WHERE code_sub = ?",
        (substance_code,)
    )
    
    result = cursor.fetchone()
    conn.close()
    
    if result and result['tags']:
        # Les tags sont stockés en JSON array dans SQLite
        import json
        return json.loads(result['tags'])
    
    return []


def get_questions_for_substance(substance_code: str, language: str = "fr") -> List[Dict]:
    """
    Récupère les questions pertinentes pour une substance donnée.
    
    Args:
        substance_code: Code de la substance
        language: Langue des questions ("fr" ou "es")
    
    Returns:
        Liste des questions triées par priorité
    """
    # 1. Récupérer les tags de la substance
    tags = get_substance_tags(substance_code)
    
    if not tags:
        return []
    
    # 2. Récupérer les questions qui matchent ces tags
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Requête pour trouver les questions dont au moins un trigger_tag correspond
    # Note: SQLite ne supporte pas les arrays natifs, on utilise JSON
    placeholders = ','.join('?' * len(tags))
    
    cursor.execute(f"""
        SELECT * FROM automedication_questions
        WHERE id IN (
            SELECT DISTINCT id FROM automedication_questions,
            json_each(trigger_tags)
            WHERE json_each.value IN ({placeholders})
        )
        ORDER BY priority ASC
    """, tags)
    
    questions = []
    for row in cursor.fetchall():
        import json
        
        question = AutomedicationQuestion(
            id=row['id'],
            text_fr=row['text_fr'],
            text_es=row['text_es'],
            trigger_tags=json.loads(row['trigger_tags']),
            risk_if_yes=row['risk_if_yes'],
            priority=row['priority'],
            explanation_fr=row.get('explanation_fr'),
            explanation_es=row.get('explanation_es')
        )
        questions.append(question.to_dict())
    
    conn.close()
    
    return questions


def calculate_automedication_score(answers: Dict[str, bool], questions: List[Dict]) -> Dict:
    """
    Calcule le score d'automédication basé sur les réponses.
    
    Args:
        answers: Dictionnaire {question_id: true/false}
        questions: Liste des questions posées
    
    Returns:
        {
            "score": "GREEN" | "ORANGE" | "RED",
            "risk_level": int (0-10),
            "recommendations": [...]
        }
    """
    max_risk = "GREEN"
    risk_score = 0
    triggered_risks = []
    
    # Mapping des niveaux de risque
    risk_hierarchy = {"GREEN": 0, "ORANGE": 5, "RED": 10}
    
    for question in questions:
        question_id = question['id']
        
        # Si l'utilisateur a répondu OUI à cette question
        if answers.get(question_id, False):
            risk_level = question['risk_if_yes']
            
            # Mettre à jour le score maximum
            if risk_hierarchy[risk_level] > risk_hierarchy[max_risk]:
                max_risk = risk_level
                risk_score = risk_hierarchy[risk_level]
            
            triggered_risks.append({
                "question": question['text_fr'],
                "risk": risk_level,
                "explanation": question.get('explanation_fr', '')
            })
    
    return {
        "score": max_risk,
        "risk_level": risk_score,
        "triggered_risks": triggered_risks,
        "safe_for_self_medication": max_risk == "GREEN"
    }
