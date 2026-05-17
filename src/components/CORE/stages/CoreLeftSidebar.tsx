import { CORE_STAGE_DATA } from './coreStageData';

export const CoreLeftSidebar: React.FC = () => {
  const { bio, focus, energy, philosophy } = CORE_STAGE_DATA;

  return (
    <div className="flex flex-col gap-5 text-xs">
      {/* Bio Section */}
      <div>
        <div className="text-cyan-400 font-mono text-[10px] tracking-[0.18em] mb-2.5">QUI SUIS-JE ?</div>
        <div className="text-[#6b6b8a] text-[12px] leading-[1.75]">{bio.text}</div>
        <div className="font-mono text-[11px] text-cyan-300 mt-3 p-3 border-l-2 border-purple-900 bg-white/[0.04]">
          {bio.codeSnippet}
        </div>
      </div>

      <div className="border-t border-white/[0.05]" />

      {/* Focus Section */}
      <div>
        <div className="text-cyan-400 font-mono text-[10px] tracking-[0.18em] mb-2.5">FOCUS ACTUEL</div>
        <div className="text-[#6b6b8a] text-[12px] mb-2.5">{focus.subtitle}</div>
        
        {focus.items.map((item) => (
          <div key={item.label} className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-[#6b6b8a] text-[12px]">{item.label}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-32 h-0.5 bg-white/[0.09] rounded relative">
                <div
                  className="h-full rounded bg-gradient-to-r from-purple-900 to-cyan-400"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-white w-8">{item.progress}%</span>
            </div>
          </div>
        ))}

        <div className="font-mono text-[10px] text-cyan-300 tracking-[0.1em] cursor-pointer mt-1">
          {focus.viewAllLink} →
        </div>
      </div>

      <div className="border-t border-white/[0.05]" />

      {/* Energy Section */}
      <div>
        <div className="text-cyan-400 font-mono text-[10px] tracking-[0.18em] mb-2">ÉNERGIE DU JOUR</div>
        <div className="w-full h-10 bg-gradient-to-b from-transparent to-transparent mb-2 border-b border-white/[0.1]" />
        <div className="font-mono text-[24px] text-white text-right mb-1">{energy.value}%</div>
        <div className="font-mono text-[10px] text-[#6b6b8a] text-right">{energy.description}</div>
        <div className="font-mono text-[10px] text-[#6b6b8a] text-right mt-1.5">{energy.bestTime}</div>
      </div>

      <div className="border-t border-white/[0.05]" />

      {/* Philosophy Section */}
      <div>
        <div className="text-cyan-400 font-mono text-[10px] tracking-[0.18em] mb-2.5">MA PHILOSOPHIE</div>
        <div className="font-mono text-[11px] text-[#6b6b8a] leading-[1.7] pl-3 border-l border-white/[0.09]">
          {philosophy.text}
        </div>
        <div className="font-mono text-[10px] text-[#3a3a55] text-right mt-1.5">{philosophy.author}</div>
      </div>
    </div>
  );
};
