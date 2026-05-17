import { useEffect, useRef } from 'react';

export const ConstellationBackground: React.FC = () => {
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

    // Constellation data: clusters of stars with connecting lines
    const constellations = [
      {
        stars: [[10, 15], [20, 10], [25, 22], [15, 25]],
        color: 'rgba(120, 100, 200, 0.4)',
        glowColor: 'rgba(150, 120, 255, 0.2)',
      },
      {
        stars: [[75, 20], [85, 15], [80, 30]],
        color: 'rgba(100, 150, 220, 0.35)',
        glowColor: 'rgba(150, 200, 255, 0.15)',
      },
      {
        stars: [[15, 70], [25, 75], [20, 85], [10, 80]],
        color: 'rgba(150, 100, 200, 0.4)',
        glowColor: 'rgba(180, 130, 255, 0.2)',
      },
      {
        stars: [[70, 75], [80, 70], [85, 80], [75, 85]],
        color: 'rgba(100, 150, 220, 0.35)',
        glowColor: 'rgba(150, 200, 255, 0.15)',
      },
      {
        stars: [[50, 5], [55, 15], [45, 12]],
        color: 'rgba(120, 150, 200, 0.3)',
        glowColor: 'rgba(150, 180, 255, 0.12)',
      },
      {
        stars: [[40, 88], [50, 85], [45, 95]],
        color: 'rgba(140, 110, 220, 0.35)',
        glowColor: 'rgba(170, 140, 255, 0.15)',
      },
    ];

    let t = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      constellations.forEach((constellation, conIdx) => {
        const scaledStars = constellation.stars.map(([x, y]) => [
          (x / 100) * w,
          (y / 100) * h,
        ] as [number, number]);

        // Draw constellation lines
        ctx.strokeStyle = constellation.color;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        scaledStars.forEach(([x, y], idx) => {
          const nextIdx = (idx + 1) % scaledStars.length;
          ctx.moveTo(scaledStars[idx][0], scaledStars[idx][1]);
          ctx.lineTo(scaledStars[nextIdx][0], scaledStars[nextIdx][1]);
        });
        ctx.stroke();

        // Draw stars with pulsing effect
        scaledStars.forEach(([x, y], starIdx) => {
          const pulse = 0.6 + Math.sin(t * 1.2 + starIdx * 0.8 + conIdx) * 0.4;
          const starSize = 1.2 * pulse;

          // Glow halo
          ctx.beginPath();
          ctx.arc(x, y, starSize * 3, 0, Math.PI * 2);
          ctx.fillStyle = constellation.glowColor;
          ctx.fill();

          // Star core
          ctx.beginPath();
          ctx.arc(x, y, starSize, 0, Math.PI * 2);
          ctx.fillStyle = constellation.color;
          ctx.fill();

          // Bright center
          ctx.beginPath();
          ctx.arc(x, y, starSize * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(220, 210, 255, ${0.7 * pulse})`;
          ctx.fill();
        });
      });

      // Floating ambient stars (background noise)
      ctx.fillStyle = 'rgba(150, 140, 200, 0.15)';
      for (let i = 0; i < 30; i++) {
        const x = (Math.sin(t * 0.3 + i * 0.5) * 0.3 + 0.5) * w + (i * 137) % w;
        const y = (Math.cos(t * 0.2 + i * 0.7) * 0.3 + 0.5) * h + (i * 211) % h;
        const x_mod = x % w;
        const y_mod = y % h;
        const opacity = 0.1 + Math.sin(t * 1 + i) * 0.08;
        ctx.fillStyle = `rgba(150, 140, 200, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x_mod, y_mod, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      t += 0.008;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />;
};
