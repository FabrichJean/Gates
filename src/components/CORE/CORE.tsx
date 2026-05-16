import { useState, useEffect } from 'react';
import { VoidStage } from './stages/VoidStage';
import { SignalStage } from './stages/SignalStage';
import { AwakeningStage } from './stages/AwakeningStage';
import { GateStage } from './stages/GateStage';

interface Stage {
  id: number;
  label: string;
  title: string;
  description: string;
  autoContinueDelay?: number;
}

const STAGES: Stage[] = [
  {
    id: 1,
    label: '1. VOID',
    title: 'VOID',
    description: 'Le vide initial. Rupture totale avec le web classique.',
    autoContinueDelay: 2500,
  },
  {
    id: 2,
    label: '2. SIGNAL',
    title: 'SIGNAL',
    description: 'Un premier signal. Le système se réveille.',
    autoContinueDelay: 3000,
  },
  {
    id: 3,
    label: '3. AWAKENING',
    title: 'AWAKENING',
    description: 'Ton univers prend forme. Les couches se construisent.',
    autoContinueDelay: 8000,
  },
  {
    id: 4,
    label: '4. GATE',
    title: 'GATE',
    description: 'La porte d\'entrée. Invitation à entrer dans ton monde.',
  },
];

export const CORE: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(1);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [autoPlay, setAutoPlay] = useState(true);

  const handleNext = () => {
    if (currentStage < STAGES.length) {
      setCompletedStages((prev) => [...prev, currentStage]);
      setCurrentStage(currentStage + 1);
    }
  };

  const handleEnter = () => {
    console.log('Entering Fabrich System');
  };

  const stage = STAGES[currentStage - 1];

  useEffect(() => {
    if (!autoPlay || !stage.autoContinueDelay || currentStage === STAGES.length) {
      return;
    }

    const timer = setTimeout(() => {
      handleNext();
    }, stage.autoContinueDelay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStage, autoPlay]);

  return (
    <div className="w-screen h-screen bg-black flex flex-col border-radius-3xl overflow-hidden">

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {currentStage === 1 && <VoidStage />}
        {currentStage === 2 && (
          <SignalStage isActive={currentStage === 2} />
        )}
        {currentStage === 3 && (
          <AwakeningStage isActive={currentStage === 3} />
        )}
        {currentStage === 4 && <GateStage onEnter={handleEnter} />}
      </div>
    </div>
  );
};

export default CORE;
