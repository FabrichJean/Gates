import { CORE_STAGE_DATA } from './coreStageData';

export const CoreBottomBar: React.FC = () => {
  const { quickAccess, metrics, vision, footer } = CORE_STAGE_DATA;

  return (
    <div className="border-t border-white/[0.05] grid grid-cols-3 gap-0 text-xs">
      {/* Quick Access */}
      <div className="px-6 py-5 border-r border-white/[0.05]">
        <div className="font-mono text-[9px] text-[#6b6b8a] tracking-[0.18em] mb-3.5">ACCÈS RAPIDE</div>
        <div className="grid grid-cols-2 gap-2">
          {quickAccess.map((btn) => (
            <button
              key={btn.label}
              className={`border rounded-md p-3 flex flex-col items-center gap-1.5 transition-all ${
                btn.active
                  ? `border-amber-500 bg-yellow-900/20`
                  : `border-white/[0.09] hover:bg-black/30`
              }`}
            >
              <div style={{ color: btn.color }} className="text-lg">
                {btn.icon}
              </div>
              <div className={`font-mono text-[9px] tracking-[0.12em] font-semibold ${btn.active ? 'text-amber-400' : 'text-white'}`}>
                {btn.label}
              </div>
              <div className="font-mono text-[8px] text-[#6b6b8a]">{btn.sublabel}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="px-6 py-5 border-r border-white/[0.05]">
        <div className="font-mono text-[9px] text-[#6b6b8a] tracking-[0.18em] mb-3.5">MÉTRIQUES DU SYSTÈME</div>
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((metric) => (
            <div key={metric.label} className="border border-white/[0.05] rounded-md p-2.5 bg-black/30">
              <div className="font-mono text-[8px] text-[#6b6b8a] tracking-[0.1em] mb-1">{metric.label}</div>
              <div className="font-mono text-[20px] text-white flex items-center gap-1.5">
                {metric.icon && <span className="text-[12px]">{metric.icon}</span>}
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vision */}
      <div className="px-6 py-5">
        <div className="font-mono text-[9px] text-[#6b6b8a] tracking-[0.18em] mb-3.5">MA VISION</div>
        <div className="text-[12px] text-[#6b6b8a] leading-[1.8] mb-3.5">{vision.text}</div>
        <div className="flex justify-between font-mono text-[9px] text-[#6b6b8a] mb-1.5">
          <span>VISION PROGRESS</span>
          <span>{vision.progress}%</span>
        </div>
        <div className="h-0.75 bg-white/[0.09] rounded overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-900 to-purple-400 rounded"
            style={{ width: `${vision.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="col-span-3 border-t border-white/[0.05] py-3.5 text-center font-mono text-[10px] text-[#6b6b8a] tracking-[0.08em] flex items-center justify-center gap-3">
        {footer}
        <span className="text-purple-400 text-lg">♥</span>
      </div>
    </div>
  );
};
