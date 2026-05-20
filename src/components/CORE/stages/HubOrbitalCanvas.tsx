import { useEffect, useRef } from 'react';

interface HubCanvasProps {
  satellites: Array<{
    id: string;
    position: string;
    color: string;
  }>;
}

export const HubOrbitalCanvas: React.FC<HubCanvasProps> = ({ satellites }) => {
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

    // Map satellite positions to coordinates (relative 0-1)
    const satPositions: Record<string, { rx: number; ry: number; color: string }> = {
      'sat-tl': { rx: 0.14, ry: 0.22, color: '#a0c0e0' },
      'sat-ml': { rx: 0.06, ry: 0.5, color: '#00e0b0' },
      'sat-bl': { rx: 0.14, ry: 0.75, color: '#00d090' },
      'sat-tr': { rx: 0.86, ry: 0.22, color: '#a0c0e0' },
      'sat-mr': { rx: 0.91, ry: 0.5, color: '#e0b840' },
      'sat-br': { rx: 0.86, ry: 0.75, color: '#80d0a0' },
    };

    let t = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h * 0.46;

      // Orbit rings
      [0.18, 0.3, 0.42].forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(w, h) * r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 60, 160, ${0.06 + i * 0.03})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Connecting lines: satellites → center
      satellites.forEach((sat) => {
        const satData = satPositions[sat.position];
        if (!satData) return;

        const sx = satData.rx * w;
        const sy = satData.ry * h;

        // Create gradient for connecting line
        const grad = ctx.createLinearGradient(sx, sy, cx, cy);
        grad.addColorStop(0, satData.color + '00');
        grad.addColorStop(0.4, satData.color + '55');
        grad.addColorStop(1, satData.color + '20');

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        // Slight curve
        const mx = (sx + cx) / 2 + (sy - cy) * 0.1;
        const my = (sy + cy) / 2 + (cx - sx) * 0.05;
        ctx.quadraticCurveTo(mx, my, cx, cy);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Orbiting dots
      satellites.forEach((sat, i) => {
        const satData = satPositions[sat.position];
        if (!satData) return;

        const angle = t * 0.5 + i * ((Math.PI * 2) / 6);
        const orbitR = Math.min(w, h) * 0.3;
        const ox = cx + Math.cos(angle) * orbitR;
        const oy = cy + Math.sin(angle) * orbitR * 0.35;

        ctx.beginPath();
        ctx.arc(ox, oy, 2, 0, Math.PI * 2);
        ctx.fillStyle = satData.color + 'aa';
        ctx.fill();
      });

      // Center glow
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
      grd.addColorStop(0, 'rgba(100, 40, 180, 0.15)');
      grd.addColorStop(1, 'rgba(100, 40, 180, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      t += 0.02;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [satellites]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};
