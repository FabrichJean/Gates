import { useEffect, useRef } from 'react';

export const HolographicOverlay: React.FC = () => {
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

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const t = Date.now() / 2000;

      ctx.clearRect(0, 0, w, h);

      // Subtle scan lines animation
      ctx.strokeStyle = 'rgba(58, 123, 189, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < h; i += 8) {
        const offset = (i + t * 100) % h;
        ctx.beginPath();
        ctx.moveTo(0, offset);
        ctx.lineTo(w, offset);
        ctx.stroke();
      }

      // Subtle grid pattern
      ctx.strokeStyle = 'rgba(58, 123, 189, 0.02)';
      ctx.lineWidth = 0.5;
      const gridSize = 60;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Corner accent lines
      const cornerLength = 30;
      const cornerOpacity = 0.08 + Math.sin(t * 2) * 0.02;
      ctx.strokeStyle = `rgba(124, 92, 207, ${cornerOpacity})`;
      ctx.lineWidth = 1;

      // Top-left corner
      ctx.beginPath();
      ctx.moveTo(10, 10);
      ctx.lineTo(10 + cornerLength, 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, 10);
      ctx.lineTo(10, 10 + cornerLength);
      ctx.stroke();

      // Top-right corner
      ctx.beginPath();
      ctx.moveTo(w - 10, 10);
      ctx.lineTo(w - 10 - cornerLength, 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w - 10, 10);
      ctx.lineTo(w - 10, 10 + cornerLength);
      ctx.stroke();

      // Bottom-left corner
      ctx.beginPath();
      ctx.moveTo(10, h - 10);
      ctx.lineTo(10 + cornerLength, h - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, h - 10);
      ctx.lineTo(10, h - 10 - cornerLength);
      ctx.stroke();

      // Bottom-right corner
      ctx.beginPath();
      ctx.moveTo(w - 10, h - 10);
      ctx.lineTo(w - 10 - cornerLength, h - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w - 10, h - 10);
      ctx.lineTo(w - 10, h - 10 - cornerLength);
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
    />
  );
};
