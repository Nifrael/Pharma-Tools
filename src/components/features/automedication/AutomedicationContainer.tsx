import React, { useState } from 'react';
import { AutomedicationSearch } from './AutomedicationSearch';
import { UnifiedQuestionnaire } from './UnifiedQuestionnaire';
import { AutomedicationScore } from './AutomedicationScore';
import './Automedication.scss';

export const AutomedicationContainer: React.FC = () => {
  const [step, setStep] = useState<'search' | 'questionnaire' | 'score'>('search');
  const [selectedSubstance, setSelectedSubstance] = useState<{
    code: string;
    name: string;
  } | null>(null);
  const [score, setScore] = useState<'green' | 'orange' | 'red' | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | undefined>(undefined);

  const handleSelectMolecule = (substanceCode: string, substanceName: string) => {
    setSelectedSubstance({ code: substanceCode, name: substanceName });
    setStep('questionnaire');
  };

  const handleQuestionnaireComplete = (
    result: 'green' | 'orange' | 'red',
    explanation?: string
  ) => {
    setScore(result);
    setAiExplanation(explanation);
    setStep('score');
  };

  const handleReset = () => {
    setStep('search');
    setSelectedSubstance(null);
    setScore(null);
    setAiExplanation(undefined);
  };

  return (
    <div className="automedication-flow">
      {step === 'search' && (
        <AutomedicationSearch onSelect={handleSelectMolecule} />
      )}

      {step === 'questionnaire' && selectedSubstance && (
        <UnifiedQuestionnaire
          substanceId={selectedSubstance.code}
          substanceName={selectedSubstance.name}
          onComplete={handleQuestionnaireComplete}
          onBack={() => setStep('search')}
        />
      )}

      {step === 'score' && score && (
        <AutomedicationScore
          score={score}
          molecule={selectedSubstance?.name || null}
          aiExplanation={aiExplanation}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
