import { useEffect, useState } from 'react';

interface SignalStageProps {
  isActive: boolean;
}

export const SignalStage: React.FC<SignalStageProps> = ({
  isActive,
}) => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (!isActive) {
      setLines([]);
      return;
    }

    const line1 = '> INITIALIZING SYSTEM...';
    setLines([line1]);

    const timer = setTimeout(() => {
      setLines([line1, ' ']);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isActive]);

  return (
    <div className="flex flex-col flex-1 min-h-[520px] bg-[#020208]">
      {/* Terminal content */}
      <div className="flex-1 font-mono text-sm text-[#777] leading-8 tracking-wide px-9 py-7">
        {lines.map((line, idx) => (
          <div key={idx} className={idx === lines.length - 1 ? 'cursor-blink' : ''}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};
