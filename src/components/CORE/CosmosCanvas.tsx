import { useEffect, useRef } from 'react';
import type { CosmosConfig } from './types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  o: number;
}

interface Node {
  x: number;
  y: number;
  r: number;
}

const DEFAULT_CONFIG: CosmosConfig = {
  particleCount: 80,
  nodeCount: 10,
  connectionDistance: 160,
};

export const CosmosCanvas: React.FC<{ config?: Partial<CosmosConfig> }> = ({
  config = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const nodesRef = useRef<Node[]>([]);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize particles and nodes only once
    if (!isInitializedRef.current) {
      particlesRef.current = Array.from(
        { length: finalConfig.particleCount },
        () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.5 + 0.3,
          o: Math.random() * 0.4 + 0.1,
        })
      );

      nodesRef.current = Array.from(
        { length: finalConfig.nodeCount },
        () => ({
          x: canvas.width * 0.15 + Math.random() * canvas.width * 0.7,
          y: canvas.height * 0.15 + Math.random() * canvas.height * 0.7,
          r: Math.random() * 2.5 + 1,
        })
      );

      isInitializedRef.current = true;
    }

    const particles = particlesRef.current;
    const nodes = nodesRef.current;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,160,255,${p.o})`;
        ctx.fill();
      });

      // Draw node connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < finalConfig.connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0,200,180,${0.35 - d / 460})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        // Draw nodes
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,229,192,.85)';
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
    />
  );
};
