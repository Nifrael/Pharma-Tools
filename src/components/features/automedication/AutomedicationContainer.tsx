import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { SearchDrug } from '../SearchDrug';
import { SelectedDrugsList } from '../SelectedDrugsList';
import { selectedDrugs } from '../../../lib/stores/medicationStore';
import { AutomedicationQuiz } from './AutomedicationQuiz';
import { AutomedicationScore } from './AutomedicationScore';
import './Automedication.scss';

export const AutomedicationContainer: React.FC = () => {
  const [step, setStep] = useState<'selection' | 'quiz' | 'score'>('selection');
  const [selectedMolecule, setSelectedMolecule] = useState<string | null>(null);
  const [score, setScore] = useState<'green' | 'orange' | 'red' | null>(null);
  
  const drugs = useStore(selectedDrugs);

  const handleStartAnalysis = () => {
    if (drugs.length === 0) return;
    
    // Pour l'instant, on prend la substance de la première molécule sélectionnée
    // On pourrait améliorer ça en permettant de choisir laquelle analyser
    const molecule = drugs[0].substances?.[0]?.name || drugs[0].name;
    setSelectedMolecule(molecule.toUpperCase());
    setStep('quiz');
  };

  const handleQuizComplete = (result: 'green' | 'orange' | 'red') => {
    setScore(result);
    setStep('score');
  };

  const handleReset = () => {
    setStep('selection');
    setSelectedMolecule(null);
    setScore(null);
  };

  return (
    <div className="automedication-flow">
      {step === 'selection' && (
        <div className="selection-step">
          <section className="search-section">
            <h2>1. Recherchez la molécule à tester</h2>
            <SearchDrug />
          </section>

          <section className="list-section">
            <h2>2. Votre sélection</h2>
            <SelectedDrugsList 
              onAnalyze={handleStartAnalysis}
              analyzeLabel="🚀 Lancer l'analyse d'automédication"
              showDefaultAnalysis={false}
            />
          </section>
        </div>
      )}
      
      {step === 'quiz' && selectedMolecule && (
        <AutomedicationQuiz 
          molecule={selectedMolecule} 
          onComplete={handleQuizComplete}
          onBack={() => setStep('selection')}
        />
      )}

      {step === 'score' && score && (
        <AutomedicationScore 
          score={score} 
          molecule={selectedMolecule}
          onReset={handleReset}
        />
      )}
    </div>
  );
};

