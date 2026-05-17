import { useEffect, useRef } from 'react';

interface Satellite {
  id: string;
  position: string;
  color: string;
}

interface EnergyLinesProps {
  satellites: Satellite[];
}

export const EnergyLines: React.FC<EnergyLinesProps> = ({ satellites }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

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

    const getSatellitePosition = (sat: Satellite) => {
      const positionMap: Record<string, { topPercent: number; leftPercent?: number; rightPercent?: number }> = {
        'sat-tl': { topPercent: 12, leftPercent: 8 },
        'sat-ml': { topPercent: 45, leftPercent: 3 },
        'sat-bl': { topPercent: 78, leftPercent: 8 },
        'sat-tr': { topPercent: 12, rightPercent: 8 },
        'sat-mr': { topPercent: 45, rightPercent: 3 },
        'sat-br': { topPercent: 78, rightPercent: 8 },
      };

      const pos = positionMap[sat.position] || positionMap['sat-tl'];
      const x = pos.leftPercent 
        ? (pos.leftPercent / 100) * canvas.width 
        : ((100 - (pos.rightPercent || 0)) / 100) * canvas.width;
      const y = (pos.topPercent / 100) * canvas.height;
      
      return { x, y };
    };

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const t = Date.now() / 1000;
      const cx = w * 0.5;
      const cy = h * 0.5;

      ctx.clearRect(0, 0, w, h);

      // Draw energy lines to each satellite with flow animation
      satellites.forEach((sat, idx) => {
        const pos = getSatellitePosition(sat);
        const satColor = sat.color || '#7c5cbf';
        
        // Main energy line
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = `${satColor}40`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Flowing energy particles along the line
        const segmentCount = 8;
        const flowOffset = (t * 2 + idx * 0.5) % 1;
        
        for (let segment = 0; segment < segmentCount; segment++) {
          const progress = (segment / segmentCount + flowOffset) % 1;
          const px = cx + (pos.x - cx) * progress;
          const py = cy + (pos.y - cy) * progress;
          const particleSize = 2 + Math.sin(t * 3 + idx) * 1;
          const opacity = Math.sin((segment / segmentCount) * Math.PI) * 0.7;

          ctx.beginPath();
          ctx.arc(px, py, particleSize, 0, Math.PI * 2);
          ctx.fillStyle = `${satColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
          ctx.fill();
        }

        // Glowing line effect
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = `${satColor}30`;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [satellites]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};
