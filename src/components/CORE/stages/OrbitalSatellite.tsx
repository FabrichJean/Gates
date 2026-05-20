import React, { useState } from 'react';

interface SatelliteProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  position: {
    top: string;
    left?: string;
    right?: string;
  };
}

export const OrbitalSatellite: React.FC<SatelliteProps> = ({
  id,
  name,
  icon,
  color,
  position,
}) => {
  const [isHovered, setIsHovered] = useState(true);
  const isLeft = !!position.left;

  const getAnimationClass = () => {
    const animations: Record<string, string> = {
      guardian: 'orbit-bob-0',
      tunnel: 'orbit-bob-1',
      'json-api': 'orbit-bob-2',
      'vs-code-ext': 'orbit-bob-3',
      'lab-chaos': 'orbit-bob-4',
      portfolio: 'orbit-bob-5',
    };
    return animations[id] || 'orbit-bob-0';
  };

  return (
    <div
      className={`absolute flex flex-col ${isLeft ? 'items-end' : 'items-start'} justify-center gap-2 cursor-pointer group transition-all duration-300 ${getAnimationClass()}`}
      style={{
        top: position.top,
        ...(position.left ? { left: position.left } : {}),
        ...(position.right ? { right: position.right } : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        @keyframes orbit-bob-0 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes orbit-bob-1 {
          0%, 100% { transform: translateY(-12px); }
          50% { transform: translateY(0px); }
        }
        @keyframes orbit-bob-2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes orbit-bob-3 {
          0%, 100% { transform: translateY(-8px); }
          50% { transform: translateY(0px); }
        }
        @keyframes orbit-bob-4 {
          0%, 100% { transform: translateY(-6px); }
          50% { transform: translateY(6px); }
        }
        @keyframes orbit-bob-5 {
          0%, 100% { transform: translateY(6px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes pulse-satellite {
          0%, 100% { 
            box-shadow: 0 0 12px currentColor;
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 24px currentColor;
            transform: scale(1.05);
          }
        }

        @keyframes core-energy-pulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        .orbit-bob-0 { animation: orbit-bob-0 3.8s ease-in-out infinite; }
        .orbit-bob-1 { animation: orbit-bob-1 4.2s ease-in-out infinite; }
        .orbit-bob-2 { animation: orbit-bob-2 4.6s ease-in-out infinite; }
        .orbit-bob-3 { animation: orbit-bob-3 4.1s ease-in-out infinite; }
        .orbit-bob-4 { animation: orbit-bob-4 4.4s ease-in-out infinite; }
        .orbit-bob-5 { animation: orbit-bob-5 4.8s ease-in-out infinite; }

        .satellite-core {
          animation: 'pulse-satellite 1.5s ease-in-out infinite';
        }

        .core-ring {
          animation: core-energy-pulse 2s ease-in-out infinite;
        }
      `}</style>

      {isLeft && (
        <div className={`text-right whitespace-nowrap pr-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div 
            style={{ color: color }} 
            className="font-mono text-[8px] font-bold tracking-widest"
          >
            {name}
          </div>
        </div>
      )}

      <div className="satellite-core flex items-center justify-center relative">
        <div
          className="absolute w-14 h-14 rounded-full core-ring"
          style={{
            backgroundColor: `${color}08`,
            borderColor: `${color}30`,
          }}
        />
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-lg flex-shrink-0 relative backdrop-blur-sm border"
          style={{
            backgroundColor: `${color}15`,
            borderColor: `${color}50`,
            color: color,
            boxShadow: isHovered ? `0 0 20px ${color}60` : `0 0 12px ${color}40`,
            transition: 'box-shadow 300ms ease-out',
          }}
        >
          {icon}
        </div>
      </div>

      {!isLeft && (
        <div className={`text-left whitespace-nowrap pl-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div 
            style={{ color: color }} 
            className="font-mono text-[8px] font-bold tracking-widest"
          >
            {name}
          </div>
        </div>
      )}
    </div>
  );
};
