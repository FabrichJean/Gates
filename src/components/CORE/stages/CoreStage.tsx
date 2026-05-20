import { useEffect, useState } from 'react';
import { CoreLeftSidebar } from './CoreLeftSidebar';
import { CoreHubArea } from './CoreHubArea';
import { CoreRightPanel } from './CoreRightPanel';
import { CoreBottomBar } from './CoreBottomBar';
import { CinematicFrame } from './CinematicFrame';

type ViewMode = 'center' | 'left' | 'right' | 'bottom';

interface CoreStageProps {
  onViewSystem?: () => void;
  scaleIn?: boolean;
}

export const CoreStage: React.FC<CoreStageProps> = ({ onViewSystem, scaleIn = true }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('center');
  useEffect(() => {
    const updateClock = () => {
      const clockEl = document.getElementById('core-clock');
      if (!clockEl) return;
      const now = new Date();
      const p = (v: number) => String(v).padStart(2, '0');
      clockEl.textContent = `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
    };
    
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CinematicFrame>
      <div
        className="relative flex flex-col flex-1 h-full bg-gradient-to-br from-black via-[#050510] to-[#0a0515] overflow-hidden rounded-lg border border-[#1a1a2e]"
        style={{
          transform: scaleIn ? 'scale(1)' : 'scale(0)',
          transformOrigin: 'center center',
          transition: scaleIn ? 'transform 3000ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
        }}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-black via-[#0a0a15] to-[#050510]">
          {/* View mode switcher */}
          <div className="flex items-center justify-center gap-2 px-5 py-2.5 border-b border-white/[0.05] bg-black/30 font-mono text-[9px]">
            <button
              onClick={() => setViewMode('center')}
              className={`px-3 py-1.5 border rounded transition-all ${
                viewMode === 'center'
                  ? 'border-purple-400 text-purple-300 bg-purple-400/10'
                  : 'border-white/[0.1] text-white/[0.5] hover:border-white/[0.2] hover:text-white/[0.7]'
              }`}
            >
              CORE
            </button>
            <button
              onClick={() => setViewMode('left')}
              className={`px-3 py-1.5 border rounded transition-all ${
                viewMode === 'left'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-400/10'
                  : 'border-white/[0.1] text-white/[0.5] hover:border-white/[0.2] hover:text-white/[0.7]'
              }`}
            >
              BIO
            </button>
            <button
              onClick={() => setViewMode('right')}
              className={`px-3 py-1.5 border rounded transition-all ${
                viewMode === 'right'
                  ? 'border-blue-400 text-blue-300 bg-blue-400/10'
                  : 'border-white/[0.1] text-white/[0.5] hover:border-white/[0.2] hover:text-white/[0.7]'
              }`}
            >
              ACTIVITY
            </button>
            <button
              onClick={() => setViewMode('bottom')}
              className={`px-3 py-1.5 border rounded transition-all ${
                viewMode === 'bottom'
                  ? 'border-amber-400 text-amber-300 bg-amber-400/10'
                  : 'border-white/[0.1] text-white/[0.5] hover:border-white/[0.2] hover:text-white/[0.7]'
              }`}
            >
              VISION
            </button>
          </div>

          {/* Main grid layout */}
          <div className="flex flex-1 overflow-hidden border-b border-white/[0.05]">
            {/* Left sidebar */}
            {viewMode === 'left' && (
              <div className="w-full px-5 py-6 border-r border-white/[0.05] overflow-y-auto">
                <CoreLeftSidebar />
              </div>
            )}

            {/* Center hub */}
            {viewMode === 'center' && (
              <div className="flex-1 border-r border-white/[0.05]">
                <CoreHubArea />
              </div>
            )}

            {/* Right panel */}
            {viewMode === 'right' && (
              <div className="w-full px-4 py-6 overflow-y-auto">
                <CoreRightPanel />
              </div>
            )}

            {/* Bottom bar content */}
            {viewMode === 'bottom' && (
              <div className="flex-1 px-5 py-6 overflow-y-auto">
                <CoreBottomBar />
              </div>
            )}
          </div>
        </div>

        {/* Corner brackets */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[#2a2a4a] opacity-30" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[#2a2a4a] opacity-30" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[#2a2a4a] opacity-30" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[#2a2a4a] opacity-30" />
      </div>
    </CinematicFrame>
  );
};
