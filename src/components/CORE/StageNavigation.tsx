interface StageNavigationProps {
  currentStage: number;
  totalStages: number;
  completedStages: number[];
}

export const StageNavigation: React.FC<StageNavigationProps> = ({
  currentStage,
  totalStages,
  completedStages,
}) => {
  const dots = Array.from({ length: totalStages }, (_, i) => i + 1);
  const lines = Array.from({ length: totalStages - 1 }, (_, i) => i + 1);

  return (
    <div className="flex gap-8 items-center">
      {dots.map((dot) => (
        <div key={`dot-${dot}`}>
          <div
            className={`w-2 h-2 rounded-full border transition-all ${
              dot < currentStage
                ? 'bg-[#00e5c0] border-[#00e5c0]'
                : dot === currentStage
                  ? 'border-[#5b9cf6] shadow-[0_0_0_2px_#5b9cf610] w-2.5 h-2.5'
                  : 'bg-[#1a1a1a] border-[#333]'
            }`}
          />
        </div>
      ))}
      {lines.map((line) => (
        <div
          key={`line-${line}`}
          className={`flex-1 h-px transition-all ${
            line < currentStage ? 'bg-[#00e5c050]' : 'bg-[#1a1a1a]'
          }`}
        />
      ))}
    </div>
  );
};
