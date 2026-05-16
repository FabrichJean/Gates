import { useEffect, useRef, useState } from 'react';

interface WarpLine {
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  opacity: number;
  width: number;
}

const WarpCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const linesRef = useRef<WarpLine[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const w = canvas.width;
    const h = canvas.height;

    linesRef.current = Array.from({ length: 90 }, () => ({
      x: w * 0.5 + (Math.random() - 0.5) * 20,
      y: h * 0.5 + (Math.random() - 0.5) * 20,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 2.5 + 0.8,
      length: Math.random() * 35 + 8,
      opacity: Math.random() * 0.35 + 0.08,
      width: Math.random() * 0.8 + 0.2,
    }));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w * 0.5;
      const cy = h * 0.5;

      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, w, h);

      linesRef.current.forEach((line) => {
        line.x += Math.cos(line.angle) * line.speed;
        line.y += Math.sin(line.angle) * line.speed;
        line.speed *= 1.015;

        const tailX = line.x - Math.cos(line.angle) * line.length;
        const tailY = line.y - Math.sin(line.angle) * line.length;

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(line.x, line.y);
        ctx.strokeStyle = `rgba(180,210,255,${line.opacity})`;
        ctx.lineWidth = line.width;
        ctx.stroke();

        if (line.x < -50 || line.x > w + 50 || line.y < -50 || line.y > h + 50) {
          line.x = cx + (Math.random() - 0.5) * 10;
          line.y = cy + (Math.random() - 0.5) * 10;
          line.angle = Math.random() * Math.PI * 2;
          line.speed = Math.random() * 1.5 + 0.5;
          line.length = Math.random() * 30 + 6;
          line.opacity = Math.random() * 0.3 + 0.06;
        }
      });

      if (Math.random() > 0.92) {
        const angle = Math.random() * Math.PI * 2;
        const sx = cx;
        const sy = cy;
        const ex = sx + Math.cos(angle) * (Math.random() * 60 + 40);
        const ey = sy + Math.sin(angle) * (Math.random() * 60 + 40);

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = `rgba(200,230,255,${Math.random() * 0.25 + 0.1})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

interface ConnectingStageProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const ConnectingStage: React.FC<ConnectingStageProps> = ({ isActive, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setShowText(false);
      return;
    }

    const t1 = setTimeout(() => setShowText(true), 200);
    return () => clearTimeout(t1);
  }, [isActive]);

  useEffect(() => {
    if (!showText) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 600);
          return 100;
        }
        return prev + Math.random() * 3 + 0.5;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [showText, onComplete]);

  const clampedProgress = Math.min(100, progress);

  return (
    <div className="relative flex flex-col flex-1 h-full bg-black overflow-hidden rounded-lg border border-[#1a1a2e]">
      <WarpCanvas />

      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,40,0.1) 2px, rgba(0,0,40,0.1) 4px)',
          backgroundSize: '100% 4px',
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div
          className={`
            flex flex-col items-center gap-3 transition-all duration-700
            ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
          `}
        >
          <h2 className="font-mono text-sm md:text-base text-[#c0c0d8] tracking-[0.2em] uppercase">
            Connecting to Core...
          </h2>

          <span className="font-mono text-xs text-[#7070a0] tracking-widest">
            {Math.floor(clampedProgress)}%
          </span>

          <div className="w-48 h-[1px] bg-[#1a1a3a] relative overflow-hidden mt-1">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#3a3a7c] to-[#6060b0] transition-all duration-100"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[#2a2a4a] opacity-30" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[#2a2a4a] opacity-30" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[#2a2a4a] opacity-30" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[#2a2a4a] opacity-30" />
    </div>
  );
};
