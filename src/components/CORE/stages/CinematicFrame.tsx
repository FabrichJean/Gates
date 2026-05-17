import React from 'react';

interface CinematicFrameProps {
  children?: React.ReactNode;
}

export const CinematicFrame: React.FC<CinematicFrameProps> = ({ children }) => {
  return (
    <div className="relative w-full h-full">
      <style>{`
        @keyframes glitch-scan {
          0% { clip-path: inset(45% 0 55% 0); }
          5% { clip-path: inset(92% 0 8% 0); }
          10% { clip-path: inset(45% 0 55% 0); }
          15% { clip-path: inset(37% 0 63% 0); }
          20% { clip-path: inset(50% 0 50% 0); }
          25% { clip-path: inset(21% 0 79% 0); }
          30% { clip-path: inset(45% 0 55% 0); }
          50% { clip-path: inset(45% 0 55% 0); }
          55% { clip-path: inset(33% 0 67% 0); }
          60% { clip-path: inset(45% 0 55% 0); }
          65% { clip-path: inset(27% 0 73% 0); }
          70% { clip-path: inset(45% 0 55% 0); }
          75% { clip-path: inset(58% 0 42% 0); }
          80% { clip-path: inset(45% 0 55% 0); }
          100% { clip-path: inset(45% 0 55% 0); }
        }

        @keyframes ambient-glow {
          0%, 100% { 
            box-shadow: 
              inset 0 0 20px rgba(124, 92, 207, 0.05),
              inset 0 0 60px rgba(58, 123, 189, 0.02);
          }
          50% { 
            box-shadow: 
              inset 0 0 30px rgba(124, 92, 207, 0.08),
              inset 0 0 80px rgba(58, 123, 189, 0.03);
          }
        }

        .cinematic-frame {
          animation: ambient-glow 8s ease-in-out infinite;
        }
      `}</style>

      <div className="cinematic-frame w-full h-full">
        {children}
      </div>
    </div>
  );
};
