import os
from typing import List, Dict
from backend.core.models import Drug, Substance

# Notre liste de test (MVP)
TARGET_DRUGS = [
    "DOLIPRANE", "CODOLIPRANE", "ADVIL", "KARDEGIC", "PREVISCAN", "XARELTO",
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

def _simplify_name(full_name: str) -> str:
    """
    Simplifie le nom en utilisant notre liste de marques cibles.
    Ex: 'DOLIPRANELIQUIZ' -> 'DOLIPRANE'
    """
    # On trie par longueur décroissante pour matcher 'CODOLIPRANE' avant 'DOLIPRANE'
    sorted_targets = sorted(TARGET_DRUGS, key=len, reverse=True)
    
    full_name_upper = full_name.upper()
    for target in sorted_targets:
        if target in full_name_upper:
            return target
            
    # Si rien n'est trouvé, on garde le premier mot par défaut
    import re
    match = re.search(r'[^a-zA-ZÀ-ÿ]', full_name)
    if match:
        return full_name[:match.start()].strip().upper()
    return full_name.upper().strip()

def load_drugs(data_dir: str) -> List[Drug]:
    """
    Charge les médicaments en les regroupant par marque pour éviter les doublons.
    """
    cis_path = os.path.join(data_dir, "CIS_bdpm.txt")
    compo_path = os.path.join(data_dir, "CIS_COMPO_bdpm.txt")

    substances_map = _load_all_substances(compo_path)
    
    unique_drugs = {} # Clé: (NomSimplifié, SubstancesIds)
    
    if not os.path.exists(cis_path):
        return []

    with open(cis_path, 'r', encoding='iso-8859-1') as f:
        for line in f:
            columns = line.strip().split('\t')
            if len(columns) >= 2:
                cis = columns[0]
                nom_complet = columns[1]
                
                # Filtrage sur nos 15 princeps
                if any(target in nom_complet.upper() for target in TARGET_DRUGS):
                    nom_simplifie = _simplify_name(nom_complet)
                    drug_substances = substances_map.get(cis, [])
                    
                    # On crée une clé unique basée sur le nom et les codes des substances
                    # pour être sûr de ne pas fusionner deux médicaments différents 
                    # qui auraient le même nom (rare mais possible)
                    sub_ids = "-".join(sorted([s.code_substance for s in drug_substances]))
                    key = f"{nom_simplifie}_{sub_ids}"
                    
                    if key not in unique_drugs:
                        unique_drugs[key] = Drug(
                            cis=cis, # On garde un CIS arbitraire parmi les doublons
                            nom=nom_simplifie,
                            substances=drug_substances
                        )
                    
    return list(unique_drugs.values())
