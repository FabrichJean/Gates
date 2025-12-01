import React from "react";

type Props = {
  open: boolean;
  percent: number; // 0-100
  processed: number;
  total: number;
  currentItem?: number | null;
  onClose?: () => void;
};

const WaterProgressModal: React.FC<Props> = ({ open, percent, processed, total, currentItem, onClose }) => {
  if (!open) return null;

  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Retrying errors — progress</h3>

        <div className="flex items-center gap-4">
          {/* SVG water container */}
          <div style={{ width: 120, height: 120, position: 'relative' }}>
            <svg viewBox="0 0 200 200" width="120" height="120" preserveAspectRatio="xMidYMid meet">
              <defs>
                <clipPath id="clipCircle">
                  <circle cx="100" cy="100" r="90" />
                </clipPath>
                <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7dd3fc" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>

              {/* background circle */}
              <circle cx="100" cy="100" r="90" fill="#e6f6ff" clipPath="url(#clipCircle)" />

              {/* group that moves up/down based on percent to simulate water level */}
              <g clipPath="url(#clipCircle)" transform={`translate(0, ${(100 - clamped) * 1.2})`}>
                {/* two waves for parallax */}
                <g style={{ transformOrigin: '50% 50%' }}>
                  <path className="wave wave1" d={`M0 70 C 30 90 70 50 100 70 C 130 90 170 50 200 70 L200 200 L0 200 Z`} fill="url(#grad)" opacity="0.9" />
                  <path className="wave wave2" d={`M0 80 C 30 60 70 100 100 80 C 130 60 170 100 200 80 L200 200 L0 200 Z`} fill="url(#grad)" opacity="0.75" />
                </g>
              </g>

              {/* outer ring */}
              <circle cx="100" cy="100" r="90" fill="none" stroke="#c7eafc" strokeWidth="6" />
            </svg>

            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div className="text-center">
                <div className="text-2xl font-bold text-sky-700 dark:text-sky-300">{Math.round(clamped)}%</div>
                <div className="text-xs text-gray-500">{processed}/{total}</div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">Processing {processed} of {total}</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-sky-400 dark:bg-sky-600 transition-all" style={{ width: `${clamped}%` }} />
            </div>

            <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">{currentItem ? `Current id: ${currentItem}` : 'Preparing...'}</div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-3 py-1 rounded-md text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200" aria-label="Close progress modal">
            Close
          </button>
        </div>

        <style>{`
          .wave1 { animation: waveMove 4s linear infinite; }
          .wave2 { animation: waveMove 6s linear infinite; transform: translateX(-30px); }
          @keyframes waveMove {
            0% { transform: translateX(0); }
            100% { transform: translateX(-200px); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default WaterProgressModal;
