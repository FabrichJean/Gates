import { CORE_STAGE_DATA } from './coreStageData';

export const CoreRightPanel: React.FC = () => {
  const { activities, quickNav } = CORE_STAGE_DATA;

  const tagColorMap: Record<string, string> = {
    'tag-tunnel': 'bg-cyan-900/20 text-cyan-400 border border-cyan-900',
    'tag-guardian': 'bg-purple-900/30 text-purple-300 border border-purple-900',
    'tag-json': 'bg-yellow-900/20 text-yellow-500 border border-yellow-900',
    'tag-lab': 'bg-green-900/20 text-green-400 border border-green-900',
    'tag-portfolio': 'bg-blue-900/20 text-blue-400 border border-blue-900',
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Activity Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-cyan-400 font-mono text-[10px] tracking-[0.18em]">ACTIVITÉ EN TEMPS RÉEL</div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-cyan-400">
            <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
            LIVE
          </div>
        </div>

        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-2.5 py-2.5 border-b border-white/[0.05] last:border-b-0">
            <div className="w-7 h-7 rounded border border-white/[0.09] flex items-center justify-center text-[13px] flex-shrink-0">
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[9px] text-[#3a3a55]">{activity.time}</div>
              <div className="font-mono text-[10px] text-[#6b6b8a] mt-0.5 leading-[1.4]">{activity.description}</div>
            </div>
            <div className={`font-mono text-[8px] px-1.75 py-0.5 rounded flex-shrink-0 ${tagColorMap[activity.tagColor]}`}>
              {activity.tag}
            </div>
          </div>
        ))}

        <div className="font-mono text-[9px] text-cyan-300 tracking-[0.1em] cursor-pointer mt-2">
          VOIR TOUT LE STREAM →
        </div>
      </div>

      <div className="border-t border-white/[0.05]" />

      {/* Quick Nav Section */}
      <div>
        <div className="text-cyan-400 font-mono text-[10px] tracking-[0.18em] mb-3">NAVIGATION RAPIDE</div>
        
        {quickNav.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 py-2.5 border-b border-white/[0.05] last:border-b-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div
              className="w-7 h-7 rounded border border-white/[0.09] flex items-center justify-center text-[14px] flex-shrink-0"
              style={{ color: item.color, borderColor: item.color + '40' }}
            >
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] font-semibold text-white">{item.label}</div>
              <div className="font-mono text-[9px] text-[#3a3a55]">{item.subtitle}</div>
            </div>
            <div className="text-[#3a3a55] text-[12px]">→</div>
          </div>
        ))}
      </div>
    </div>
  );
};
