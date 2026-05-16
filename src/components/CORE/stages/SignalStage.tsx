import { useEffect, useState } from 'react';

interface SignalStageProps {
  isActive: boolean;
}

export const SignalStage: React.FC<SignalStageProps> = ({
  isActive,
}) => {
  const [lines, setLines] = useState<number[]>([]);

  useEffect(() => {
    if (!isActive) {
      setLines([]);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setLines([0]), 200));
    timers.push(setTimeout(() => setLines([0, 1]), 800));
    timers.push(setTimeout(() => setLines([0, 1, 2]), 1400));
    timers.push(setTimeout(() => setLines([0, 1, 2, 3]), 2200));

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [isActive]);

  const textLines = [
    '> SIGNAL DETECTED',
  ];

  return (
    <div className="flex flex-col flex-1 min-h-[520px] bg-[#020208] relative overflow-hidden">
      {/* Subtle scanline animation in background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(100,150,255,0.1) 2px, rgba(100,150,255,0.1) 4px)',
          animation: 'scanlines 8s linear infinite',
        }}
      />

      {/* Terminal content */}
      <div className="flex-1 font-mono text-sm text-[#888] leading-8 tracking-wide relative z-10 px-9 py-7">
        {textLines.map((line, idx) => (
          <div 
            key={idx} 
            className={`transition-opacity duration-700 ${lines.includes(idx) ? 'opacity-100' : 'opacity-0'}`}
          >
            {line}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }
      `}</style>
    </div>
  );
};
