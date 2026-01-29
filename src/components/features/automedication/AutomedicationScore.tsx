import React from 'react';

interface Props {
  score: 'green' | 'orange' | 'red';
  molecule: string | null;
  onReset: () => void;
}

export const AutomedicationScore: React.FC<Props> = ({ score, molecule, onReset }) => {
  const getScoreData = () => {
    switch (score) {
      case 'green':
        return {
          label: 'FAIBLE RISQUE',
          text: `La prise de ${molecule} semble sûre dans votre situation. Respectez toujours les doses prescrites.`,
          class: 'score-green'
        };
      case 'orange':
        return {
          label: 'ATTENTION',
          text: `La prise de ${molecule} nécessite une vigilance particulière. Il est recommandé de demander l'avis de votre pharmacien.`,
          class: 'score-orange'
        };
      case 'red':
        return {
          label: 'DÉCONSEILLÉ',
          text: `La prise de ${molecule} est fortement déconseillée ou contre-indiquée dans votre situation. Consultez un médecin.`,
          class: 'score-red'
        };
    }
  };

  const data = getScoreData();

  return (
    <div className="automedication-score">
      <div className={`score-indicator ${data.class}`}>
        <span className="score-value">{score === 'green' ? 'A' : score === 'orange' ? 'B/C' : 'D/E'}</span>
        <span className="score-label">{data.label}</span>
      </div>
      
      <p className="advice">{data.text}</p>
      
      <button className="btn-reset" onClick={onReset}>Faire une autre évaluation</button>
    </div>
  );
};
