import React, { useState } from 'react';

interface Props {
  molecule: string;
  onComplete: (result: 'green' | 'orange' | 'red') => void;
  onBack: () => void;
}

// Logique simple pour l'exemple
// Pourrait être beaucoup plus complexe et dynamique (chargée depuis le backend)
const QUESTIONS = [
  {
    id: 'pregnant',
    text: 'Êtes-vous enceinte ?',
    riskMolecules: ['IBUPROFENE', 'ASPIRINE'], // Molécules à risque pour cette question
    riskLevel: 'red' // Niveau de risque si OUI
  },
  {
    id: 'liver_issues',
    text: 'Avez-vous des problèmes de foie connus ?',
    riskMolecules: ['PARACETAMOL'],
    riskLevel: 'orange' 
  },
  {
    id: 'ulcer',
    text: 'Avez-vous un ulcère à l\'estomac ou des antécédents ?',
    riskMolecules: ['IBUPROFENE', 'ASPIRINE'],
    riskLevel: 'red'
  },
  {
    id: 'fever_duration',
    text: 'La fièvre dure-t-elle depuis plus de 3 jours ?',
    riskMolecules: ['PARACETAMOL', 'IBUPROFENE', 'ASPIRINE'],
    riskLevel: 'orange'
  }
];

export const AutomedicationQuiz: React.FC<Props> = ({ molecule, onComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  const relevantQuestions = QUESTIONS.filter(q => 
    !q.riskMolecules || q.riskMolecules.includes(molecule) || q.riskMolecules.length === 0
  );

  const handleAnswer = (answer: boolean) => {
    const currentQ = relevantQuestions[currentQuestionIndex];
    const newAnswers = { ...answers, [currentQ.id]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < relevantQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateScore(newAnswers);
    }
  };

  const calculateScore = (finalAnswers: Record<string, boolean>) => {
    let maxRisk = 'green';
    
    // On analyse les réponses OUI (true)
    for (const q of relevantQuestions) {
      if (finalAnswers[q.id]) {
        // L'utilisateur a répondu OUI, ce qui implique un risque
        if (q.riskLevel === 'red') {
          maxRisk = 'red';
          break; // Stop, on ne peut pas faire pire
        }
        if (q.riskLevel === 'orange') {
          maxRisk = 'orange';
        }
      }
    }
    
    onComplete(maxRisk as 'green' | 'orange' | 'red');
  };

  if (relevantQuestions.length === 0) {
    return (
      <div className="automedication-quiz">
        <h2>Pas de questions spécifiques pour {molecule}</h2>
        <button onClick={() => onComplete('green')}>Voir le résultat</button>
      </div>
    );
  }

  const currentQ = relevantQuestions[currentQuestionIndex];

  return (
    <div className="automedication-quiz">
      <h2>À propos de votre prise de <span>{molecule}</span></h2>
      
      <div className="question-card">
        <h3>{currentQ.text}</h3>
        <div className="options">
          <button onClick={() => handleAnswer(true)}>OUI</button>
          <button onClick={() => handleAnswer(false)}>NON</button>
        </div>
      </div>

      <div className="navigation">
        <button className="btn-back" onClick={onBack}>Retour</button>
        <span>Question {currentQuestionIndex + 1} / {relevantQuestions.length}</span>
      </div>
    </div>
  );
};
