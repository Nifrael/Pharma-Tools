import os
from typing import List, Dict
from backend.core.models import Drug, Substance

# Notre liste de test (MVP)
TARGET_DRUGS = [
    "DOLIPRANE", "ADVIL", "KARDEGIC", "PREVISCAN", "XARELTO",
    "TAHOR", "CLAMOXYL", "AUGMENTIN", "SPASFON", "VENTOLINE",
    "LASILIX", "INEXIUM", "PLAVIX", "LEVOTHYROX", "MILLEPERTUIS"
]

def _load_all_substances(file_path: str) -> Dict[str, List[Substance]]:
    """
    Lit le fichier des compositions et regroupe les substances par code CIS.
    """
    substances_by_cis = {}
    
    if not os.path.exists(file_path):
        return {}

    with open(file_path, 'r', encoding='iso-8859-1') as f:
        for line in f:
            columns = line.strip().split('\t')
            # Structure du fichier CIS_COMPO_bdpm.txt :
            # 0: Code CIS
            # 1: Désignation de l'élément pharmaceutique
            # 2: Code substance
            # 3: Nom substance
            # 4: Dosage
            if len(columns) >= 4:
                cis = columns[0]
                nom_substance = columns[3]
                dosage = columns[4] if len(columns) > 4 else ""
                code_substance = columns[2]

                substance = Substance(
                    code_substance=code_substance,
                    nom=nom_substance,
                    dosage=dosage
                )

                if cis not in substances_by_cis:
                    substances_by_cis[cis] = []
                substances_by_cis[cis].append(substance)
            
    return substances_by_cis

def load_drugs(data_dir: str) -> List[Drug]:
    """
    Fonction principale qui charge les médicaments filtrés et leurs substances.
    """
    cis_path = os.path.join(data_dir, "CIS_bdpm.txt")
    compo_path = os.path.join(data_dir, "CIS_COMPO_bdpm.txt")

    # 1. Charger toutes les molécules en mémoire
    substances_map = _load_all_substances(compo_path)
    
    drugs = []
    
    if not os.path.exists(cis_path):
        return []

    # 2. Lire les médicaments et filtrer
    with open(cis_path, 'r', encoding='iso-8859-1') as f:
        for line in f:
            columns = line.strip().split('\t')
            # Structure du fichier CIS_bdpm.txt :
            # 0: Code CIS
            # 1: Nom du médicament
            # ...
            if len(columns) >= 2:
                cis = columns[0]
                nom_complet = columns[1]
                
                # Vérifier si le médicament fait partie de notre liste cible
                # On vérifie si un des noms de TARGET_DRUGS est dans le nom complet
                if any(target in nom_complet.upper() for target in TARGET_DRUGS):
                    drug_substances = substances_map.get(cis, [])
                    
                    drug = Drug(
                        cis=cis,
                        nom=nom_complet,
                        substances=drug_substances
                    )
                    drugs.append(drug)
                    
    return drugs
