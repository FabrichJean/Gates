import { CORE_STAGE_DATA } from './coreStageData';
import { CorePortraitCanvas } from './CorePortraitCanvas';
import { OrbitalSatellite } from './OrbitalSatellite';
import { HolographicOverlay } from './HolographicOverlay';
import { ConstellationBackground } from './ConstellationBackground';
import { CosmicClouds } from './CosmicClouds';
import { HubOrbitalCanvas } from './HubOrbitalCanvas';

export const CoreHubArea: React.FC = () => {
  const { hub, satellites, quote } = CORE_STAGE_DATA;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.05] bg-black/50 font-mono text-[10px] text-[#6b6b8a] tracking-[0.1em]">
        <div className="flex gap-1 items-center">
          <span style={{ color: '#3a3a55' }}>&lt;</span> CORE ID: {hub.statusCode}
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> ÉTAT : ACTIVE
        </div>
        <div>TEMPS SYSTÈME : <span className="text-white" id="core-clock">--:--:--</span></div>
      </div>

      {/* Hub area - Cinematic consciousness core */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-5 overflow-hidden bg-gradient-to-b from-black via-[#0a0a15] to-black">
        {/* Cosmic clouds background */}
        <CosmicClouds />

        {/* Constellation background */}
        <ConstellationBackground />

        {/* Orbital canvas - connecting satellites to center */}
        <div className="absolute inset-0 pointer-events-none">
          <HubOrbitalCanvas satellites={satellites} />
        </div>

        {/* Holographic interface overlay */}
        <HolographicOverlay />

        {/* Background particles */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <style>{`
              @keyframes float-particle {
                0%, 100% { transform: translate(0, 0); opacity: 0; }
                50% { opacity: 0.6; }
              }
              .float-particle {
                animation: float-particle 8s ease-in-out infinite;
              }
            `}</style>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute float-particle"
                style={{
                  width: Math.random() * 2 + 1 + 'px',
                  height: Math.random() * 2 + 1 + 'px',
                  backgroundColor: Math.random() > 0.5 ? '#7c5cbf' : '#3a7bbd',
                  borderRadius: '50%',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  animationDelay: Math.random() * 4 + 's',
                }}
              />
            ))}
          </div>
        </div>

        {/* Orbital satellites */}
        {satellites.map((sat) => {
          const positionMap: Record<string, { top: string; left?: string; right?: string }> = {
            'sat-tl': { top: '20%', left: '30%' },
            'sat-ml': { top: '50%', left: '25%' },
            'sat-bl': { top: '80%', left: '30%' },
            'sat-tr': { top: '20%', right: '30%' },
            'sat-mr': { top: '50%', right: '25%' },
            'sat-br': { top: '80%', right: '30%' },
          };
          
          return (
            <OrbitalSatellite
              key={sat.id}
              id={sat.id}
              name={sat.name}
              icon={sat.icon}
              color={sat.color}
              position={positionMap[sat.position] || positionMap['sat-tl']}
            />
          );
        })}

        {/* Cinematic center portrait */}
        <div className="absolute inset-1/4 flex items-center justify-center z-20">
          <div className="relative w-full h-full">
            {/* Consciousness field */}
            <div className="absolute inset-0">
              <CorePortraitCanvas portraitImage={hub.portraitImage} />
            </div>
            
            {/* Title and subtitle */}
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-1 pb-8">
              <div className="font-mono text-[18px] font-bold text-white tracking-[0.3em]">
                {hub.name}
              </div>
              <div className="font-mono text-[8px] text-[#6b6b8a] tracking-[0.2em]">
                {hub.title}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote section */}
      <div className="border-t border-white/[0.05] p-5 min-h-[90px] flex items-center justify-center relative">
        <div className="font-mono text-[28px] text-white/[0.13] absolute top-3 left-5">"</div>
        <div className="font-mono text-[12px] text-white text-center leading-[1.9] tracking-[0.04em]">
          {quote}
        </div>
        <div className="font-mono text-[28px] text-white/[0.13] absolute bottom-3 right-5">"</div>
      </div>
    </div>
  );
};
