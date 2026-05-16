interface GateStageProps {
  onEnter?: () => void;
}

export const GateStage: React.FC<GateStageProps> = ({ onEnter }) => {
  return (
    <div className="flex flex-col flex-1 min-h-[520px] bg-black">
      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-center relative z-10">
        <h1 className="font-mono text-2xl font-bold text-[#dde] tracking-widest">
          {/* FABRICH SYSTEM */}
          THE SYSTEM
        </h1>
        <p className="font-mono text-xs text-[#4040a0] tracking-widest mt-0.5">
          DEVELOPER &nbsp;•&nbsp; BUILDER &nbsp;•&nbsp; EXPLORER
        </p>
        <p className="font-mono text-xs text-[#444] tracking-widest leading-relaxed mt-2">
          A LIVING ECOSYSTEM OF<br />
          IDEAS, PROJECTS AND EXPERIMENTS.
        </p>
        <button
          onClick={onEnter}
          className="font-mono border border-[#3a3a7c] text-[#7070cc] text-xs px-7 py-3 rounded w-55 text-center tracking-widest mt-4 cursor-pointer bg-transparent hover:bg-[#0d0d2a] hover:text-[#aaaaff] hover:border-[#5050a0] transition-all"
        >
          &gt; ENTER THE SYSTEM ↗
        </button>
      </div>
    </div>
  );
};
