import { useEffect, useRef } from 'react';

interface DataFlowProps {
  color: string;
  delay: number;
}

const DataFlowLine: React.FC<DataFlowProps> = ({ color, delay }) => {
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
      const t = (Date.now() / 1000 - delay) * 2;

      ctx.clearRect(0, 0, w, h);

      const lineCount = 5;
      const lineSpacing = h / lineCount;

      for (let line = 0; line < lineCount; line++) {
        const y = line * lineSpacing + lineSpacing / 2;
        const offset = (t % w);

        for (let i = -2; i < 3; i++) {
          const x = (i * w * 0.4 + offset) % w;
          const size = 3 + Math.sin(t + line) * 1;
          const opacity = Math.sin((x / w) * Math.PI + line) * 0.5 + 0.3;

          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `${color}${Math.round(opacity * 200).toString(16).padStart(2, '0')}`;
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [color, delay]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export { DataFlowLine };
