import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { selectedDrugs, removeDrug } from '../../lib/stores/medicationStore';
import './SelectedDrugsList.scss';


// --- 1. DÉFINITION DES TYPES (Doit correspondre au Python) ---

interface InteractionResult {
  molecule_a: string;
  molecule_b: string;
  level_risk: string;     // codes: CI, AD, PE, PC
  risk: string;
  management?: string;
}

interface SafePillsAnalysis {
  interaction_detected: boolean;
  global_severity: "Rouge" | "Orange" | "Jaune" | "Bleu" | "Vert" | null;
  explanation: string;
  conduct_to_follow: string;
  technical_details: InteractionResult[];
}

const RISK_LABELS: Record<string, { label: string; color: string }> = {
  "CI": { label: "Contre-indication", color: "#e74c3c" },      // Rouge
  "AD": { label: "Association déconseillée", color: "#e67e22" }, // Orange
  "PE": { label: "Précaution d'emploi", color: "#f1c40f" },      // Jaune
  "PC": { label: "À prendre en compte", color: "#3498db" }       // Bleu
};

interface Props {
  onAnalyze?: (drugs: any[]) => void;
  analyzeLabel?: string;
  customAnalysis?: SafePillsAnalysis | null;
  customLoading?: boolean;
  customError?: string | null;
  showDefaultAnalysis?: boolean;
}

export const SelectedDrugsList: React.FC<Props> = ({ 
  onAnalyze, 
  analyzeLabel = "🔍 Analyser l'ordonnance",
  customAnalysis,
  customLoading,
  customError,
  showDefaultAnalysis = true
}) => {
  const drugs = useStore(selectedDrugs);
  const [internalAnalysis, setInternalAnalysis] = useState<SafePillsAnalysis | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const analysis = customAnalysis !== undefined ? customAnalysis : internalAnalysis;
  const loading = customLoading !== undefined ? customLoading : internalLoading;
  const error = customError !== undefined ? customError : internalError;

  const handleAnalyze = async () => {
    if (onAnalyze) {
      onAnalyze(drugs);
      return;
    }

    if (drugs.length < 2) return;
    setInternalLoading(true);
    setInternalError(null);
    setInternalAnalysis(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drugs),
      });

      if (!response.ok) throw new Error("Erreur serveur");
      const data = await response.json();
      setInternalAnalysis(data);
    } catch (err) {
      setInternalError("Impossible de joindre le serveur d'analyse.");
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div className="selected-drugs-list">
      {/* 1. LISTE DES MÉDICAMENTS */}
      <div className="drugs-list">
        {drugs.length === 0 ? (
          <p className="drugs-list__empty">Aucun médicament sélectionné.</p>
        ) : (
          <ul className="drugs-list__container">
            {drugs.map((drug) => (
              <li key={drug.cis} className="drugs-list__item">
                <div className="drugs-list__info">
                  <span className="drugs-list__name">{drug.name}</span>
                </div>
                <button onClick={() => removeDrug(drug.cis)} className="drugs-list__remove">&times;</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 2. BOUTON D'ACTION */}
      <div className="action-area text-center">
        <button 
          onClick={handleAnalyze} 
          disabled={drugs.length === 0 || loading || (onAnalyze ? false : drugs.length < 2)} 
          className="action-area__button"
        >
          {loading ? 'Analyse en cours...' : analyzeLabel}
        </button>
      </div>

      {/* 3. AFFICHAGE DES RÉSULTATS */}
      {error && <div className="analysis-error">{error}</div>}

      {showDefaultAnalysis && analysis && (
        <div className={`analysis-result analysis-result--${analysis.global_severity?.toLowerCase() || 'default'}`}>
          <h3 className="analysis-result__title">
            {analysis.global_severity === 'Rouge' && '⛔'}
            {analysis.global_severity === 'Orange' && '⚠️'}
            {analysis.global_severity === 'Jaune' && '✋'}
            {analysis.global_severity === 'Bleu' && 'ℹ️'}
            {analysis.global_severity === 'Vert' && '✅'}
            Analyse : Niveau {analysis.global_severity || 'Neutre'}
          </h3>

          <div className="analysis-result__expert">
            <h4>L'avis de l'expert</h4>
            <p>{analysis.explanation}</p>
          </div>

          <div className="analysis-result__action">
            <h4>Conduite à tenir</h4>
            <p>{analysis.conduct_to_follow}</p>
          </div>

          {analysis.technical_details.length > 0 && (
            <div className="analysis-result__technical">
              <details open>
                <summary>Détails techniques (Analyse pharmacologique)</summary>
                <ul className="technical-list">
                  {analysis.technical_details.map((detail, idx) => {
                    const riskInfo = RISK_LABELS[detail.level_risk] || { label: detail.level_risk, color: "#95a5a6" };
                    return (
                      <li key={idx} className="technical-item">
                        <div className="technical-item__header">
                          <span className="badge" style={{ backgroundColor: riskInfo.color }}>
                            {riskInfo.label}
                          </span>
                          <strong>{detail.molecule_a} + {detail.molecule_b}</strong>
                        </div>
                        <div className="technical-item__body">
                          <p><strong>Mécanisme :</strong> {detail.risk}</p>
                          {detail.management && <p><strong>Conseil :</strong> {detail.management}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

