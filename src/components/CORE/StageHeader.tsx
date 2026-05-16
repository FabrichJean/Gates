import { StageNavigation } from './StageNavigation';

interface StageHeaderProps {
  label: string;
  title: string;
  description: string;
  currentStage: number;
  totalStages: number;
  completedStages: number[];
}

export const StageHeader: React.FC<StageHeaderProps> = ({
  label,
  title,
  description,
  currentStage,
  totalStages,
  completedStages,
}) => {
  return (
    <div className="border-b border-[#111] px-9 py-7">
      <StageNavigation
        currentStage={currentStage}
        totalStages={totalStages}
        completedStages={completedStages}
      />
      <div className="mt-4.5">
        <p className="font-mono text-xs text-[#444] tracking-widest mb-1.5">
          {label}
        </p>
        <h1 className="font-mono text-2xl font-bold text-[#5b9cf6] tracking-widest mb-2">
          {title}
        </h1>
        <p className="font-mono text-sm text-[#555] tracking-wider leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
