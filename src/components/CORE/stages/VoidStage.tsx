interface VoidStageProps {
  onNext?: () => void;
}

export const VoidStage: React.FC<VoidStageProps> = () => {
  return (
    <div className="flex flex-col flex-1 min-h-[520px] bg-black">
      {/* Empty void space */}
      <div className="flex-1" />
    </div>
  );
};
