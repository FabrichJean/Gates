import { useEffect, useState } from 'react';
import { CosmosCanvas } from '../CosmosCanvas';

interface AwakeningStageProps {
  isActive: boolean;
}

const TERMINAL_LINES = [
  { text: '> INITIALIZING SYSTEM...', delay: 0.3 },
  { text: 'LOADING UNIVERSE LAYERS...', delay: 1.2 },
  { text: 'CORE STRUCTURE... OK', delay: 2.1, highlight: true },
  { text: 'INTERFACE LAYER... OK', delay: 3.0, highlight: true },
  { text: 'CONNECTING NODES...', delay: 3.9 },
  { text: 'BUILDING VISUALS...', delay: 4.8 },
  { text: 'SYSTEM STATUS: ONLINE', delay: 5.7, online: true },
];

export const AwakeningStage: React.FC<AwakeningStageProps> = ({
  isActive,
}) => {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);

  useEffect(() => {
    if (!isActive) {
      setVisibleLines([]);
      return;
    }

    const timers = TERMINAL_LINES.map((line, idx) => {
      return setTimeout(() => {
        setVisibleLines((prev) => [...prev, idx]);
      }, line.delay * 1000);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <div className="flex flex-col flex-1 h-full bg-[#020208] relative overflow-hidden">
      {/* Cosmos background */}
      <CosmosCanvas />

      {/* Terminal content */}
      <div className="flex-1 font-mono text-sm text-[#777] leading-8 tracking-wide relative z-10 px-9 py-7">
        {TERMINAL_LINES.map((line, idx) => (
          <div key={idx} className="overflow-hidden whitespace-nowrap">
            {visibleLines.includes(idx) && (
              <div className="w-full animate-typewrite">
                <span>
                  {line.text.split('...')[0]}
                </span>
                {line.highlight && (
                  <span className="text-[#888]">... OK</span>
                )}
                {line.online && (
                  <span className="text-[#00e5c0]">ONLINE</span>
                )}
                {!line.highlight && !line.online && (
                  <span>{line.text.split('...').slice(1).join('...')}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
