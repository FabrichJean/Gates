import { useState, useEffect } from 'react';
import { VoidStage } from './stages/VoidStage';
import { SignalStage } from './stages/SignalStage';
import { AwakeningStage } from './stages/AwakeningStage';
import { GateStage } from './stages/GateStage';
import { ConnectingStage } from './stages/ConnectingStage';
import { CoreStage } from './stages/CoreStage';

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
    autoContinueDelay: 4500,
  },
  {
    id: 2,
    label: '2. SIGNAL',
    title: 'SIGNAL',
    description: 'Un premier signal. Le système se réveille.',
    autoContinueDelay: 3500,
  },
  {
    id: 3,
    label: '3. AWAKENING',
    title: 'AWAKENING',
    description: 'Ton univers prend forme. Les couches se construisent.',
    autoContinueDelay: 8500,
  },
  {
    id: 4,
    label: '4. GATE',
    title: 'GATE',
    description: 'La porte d\'entrée. Invitation à entrer dans ton monde.',
  },
  {
    id: 5,
    label: '5. CONNECTING',
    title: 'CONNECTING',
    description: 'Connexion au noyau du système.',
    autoContinueDelay: 12000,
  },
  {
    id: 6,
    label: '6. CORE',
    title: 'CORE',
    description: 'Tu es au cœur du système. Explore et découvre.',
  },
];

export const CORE: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(1);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [autoPlay, setAutoPlay] = useState(true);
  const [transitionOpacity, setTransitionOpacity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [gateIsTransitioning, setGateIsTransitioning] = useState(false);
  const [coreScaleIn, setCoreScaleIn] = useState(false);
  const [showConnectingBg, setShowConnectingBg] = useState(true);

  const handleNext = () => {
    if (currentStage < STAGES.length) {
      // Si on passe de GATE à CONNECTING, déclencher la dispersion
      if (currentStage === 4) {
        setGateIsTransitioning(true);

        // Laisser 300ms compression + 1400ms dispersion = 1700ms avant ConnectingStage
        setTimeout(() => {
          setCompletedStages((prev) => [...prev, currentStage]);
          setCurrentStage(currentStage + 1);
          setGateIsTransitioning(false);
        }, 1700);
      } else if (currentStage === 5) {
        // Transition de CONNECTING à CORE : CoreStage zoom-in par dessus
        setCoreScaleIn(false);
        setCurrentStage(currentStage + 1);
        setTransitionOpacity(1); // Reset opacity pour pas de fade
        
        // Déclencher l'animation de scale après le changement
        requestAnimationFrame(() => {
          setCoreScaleIn(true);
        });
        
        // Masquer ConnectingStage après l'animation du CoreStage (3000ms)
        setTimeout(() => {
          setShowConnectingBg(false);
          setCompletedStages((prev) => [...prev, 5]);
        }, 3000);
      } else {
        // Pour les autres transitions, utiliser le fade classique
        setIsTransitioning(true);
        setTransitionOpacity(0);

        setTimeout(() => {
          setCompletedStages((prev) => [...prev, currentStage]);
          setCurrentStage(currentStage + 1);
          setTransitionOpacity(1);
          setIsTransitioning(false);
        }, 1000);
      }
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStage]);

  return (
    <div className="w-screen h-screen bg-black flex flex-col border-radius-3xl overflow-hidden">
      {/* Content with smooth transition */}
      <div
        className="flex-1 overflow-hidden"
        style={{ 
          opacity: transitionOpacity,
          transition: currentStage === 6 ? 'none' : 'opacity 600ms ease-out'
        }}
      >
        {currentStage === 1 && <VoidStage />}
        {currentStage === 2 && (
          <SignalStage isActive={currentStage === 2} />
        )}
        {currentStage === 3 && (
          <AwakeningStage isActive={currentStage === 3} />
        )}
        {currentStage === 4 && <GateStage onEnter={handleNext} isTransitioning={gateIsTransitioning} />}
        {currentStage === 5 && (
          <ConnectingStage isActive={currentStage === 5} onComplete={handleNext} />
        )}
        
        {/* CoreStage appears on top of ConnectingStage during transition */}
        {currentStage === 6 && (
          <>
            {/* ConnectingStage as background - visible during scale-in */}
            {showConnectingBg && (
              <div className="absolute inset-0 z-0">
                <ConnectingStage isActive={false} />
              </div>
            )}
            
            {/* CoreStage in foreground with scale animation */}
            <div className="relative z-10 flex-1 flex flex-col w-full h-full">
              <CoreStage onViewSystem={() => console.log('View System')} scaleIn={coreScaleIn} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CORE;
