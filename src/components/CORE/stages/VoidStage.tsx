interface VoidStageProps {
  onNext?: () => void;
}

export const VoidStage: React.FC<VoidStageProps> = () => {
  return (
    <div className="flex flex-col flex-1 min-h-[520px] bg-black">
      {/* Empty void space */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="flex justify-between items-center px-9 py-5">
        <div className="font-mono text-xs text-[#2a4a2a] tracking-widest animate-pulse">
          AUTO CONTINUE...
        </div>
      </div>
    </div>
  );
};
