interface VoidStageProps {
  onNext?: () => void;
}

export const VoidStage: React.FC<VoidStageProps> = () => {
  return (
    <div className="flex flex-col flex-1 min-h-[520px] bg-black overflow-hidden relative">
      {/* Extremely subtle breathing glow in center */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(100,100,200,0.08) 0%, transparent 70%)',
          animation: 'pulse 8s ease-in-out infinite',
        }}
      />
      
      {/* Minimal corner indicator - signal arrival */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div 
          className="w-1 h-1 bg-[#5555cc]"
          style={{
            boxShadow: '0 0 20px rgba(85, 85, 204, 0.3)',
            animation: 'glow 4s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.05; }
          50% { transform: scale(1.2); opacity: 0.12; }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
