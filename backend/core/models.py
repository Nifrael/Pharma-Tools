from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class SubstanceMetaData(BaseModel):
    photosensibility: Optional[bool] = False
    driving_risk: int = Field(0, ge=0, le=3, description="Niveau de vigilance de 1 à 3.")
    advice: str = Field("", description="Conseil à donner au patient.")  

class Substance(BaseModel):
    code_sub: str
    name: str
    dose: Optional[str] = None
    therapeutic_class: Optional[str] = None
    interaction_type: Literal["THERAPEUTIC_CLASS", "SUBSTANCE"] = "THERAPEUTIC_CLASS"

    metadata: SubstanceMetaData = Field(default_factory=SubstanceMetaData)

class Drug(BaseModel):
    """
    Représente un médicament simplifié pour la recherche et les interactions.
    """
    cis: str
    name: str
    administration_way: Optional[str] = None
    substances: List[Substance] = []

class Interaction(BaseModel):
    target_a: str = Field(..., description="Nom de la classe OU de la molécule")
    target_b: str = Field(..., description="Nom de la classe OU de la molécule")
    risk_level: str = Field(..., description="PE (Précaution), AD (Déconseillé), CI (Contre-indiqué)")
    mechanism: str
    conduct_to_follow: Optional[str] = None