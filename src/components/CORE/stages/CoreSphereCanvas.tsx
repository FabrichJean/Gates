import { useEffect, useRef } from 'react';

interface SphereNode {
  ax: number;
  ay: number;
  x: number;
  y: number;
  z: number;
}

interface OrbitRing {
  inclination: number;
  nodeCount: number;
  rotationSpeed: number;
  nodes: SphereNode[];
}

export const CoreSphereCanvas: React.FC = () => {
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

    const ringConfigs = [
      { inclination: 0, nodeCount: 14, rotationSpeed: 0.4 },
      { inclination: Math.PI / 3.2, nodeCount: 12, rotationSpeed: -0.35 },
      { inclination: -Math.PI / 3.8, nodeCount: 12, rotationSpeed: 0.3 },
      { inclination: Math.PI / 2.1, nodeCount: 10, rotationSpeed: -0.25 },
      { inclination: -Math.PI / 6, nodeCount: 12, rotationSpeed: 0.22 },
    ];

    const orbits: OrbitRing[] = ringConfigs.map((cfg) => ({
      ...cfg,
      nodes: Array.from({ length: cfg.nodeCount }, (_, i) => ({
        ax: (i / cfg.nodeCount) * Math.PI * 2,
        ay: cfg.inclination,
        x: 0,
        y: 0,
        z: 0,
      })),
    }));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const t = Date.now() / 1000;

      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const radius = Math.min(w, h) * 0.38;
      const rotX = t * 0.18;
      const rotY = t * 0.28;

      orbits.forEach((orbit) => {
        orbit.nodes.forEach((n) => {
          const angle = n.ax + t * orbit.rotationSpeed;

          const lx = Math.cos(angle);
          const ly = Math.sin(angle);
          const lz = 0;

          const cosI = Math.cos(orbit.inclination);
          const sinI = Math.sin(orbit.inclination);
          const rx = lx;
          const ry = ly * cosI - lz * sinI;
          const rz = ly * sinI + lz * cosI;

          const cosY = Math.cos(rotY);
          const sinY = Math.sin(rotY);
          const px = rx * cosY - rz * sinY;
          const pz = rx * sinY + rz * cosY;

          const cosX = Math.cos(rotX);
          const sinX = Math.sin(rotX);
          const py = ry * cosX - pz * sinX;
          const pz2 = ry * sinX + pz * cosX;

          n.x = cx + px * radius;
          n.y = cy - py * radius;
          n.z = pz2;
        });
      });

      orbits.forEach((orbit) => {
        for (let i = 0; i < orbit.nodes.length; i++) {
          const a = orbit.nodes[i];
          const b = orbit.nodes[(i + 1) % orbit.nodes.length];
          const avgZ = (a.z + b.z) / 2;
          const depthFade = (avgZ + 1) / 2;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(120,190,255,${0.12 + depthFade * 0.35})`;
          ctx.lineWidth = 0.5 + depthFade * 0.3;
          ctx.stroke();
        }
      });

      for (let i = 0; i < orbits.length - 1; i++) {
        const curr = orbits[i];
        const next = orbits[i + 1];
        const step = Math.max(1, Math.floor(curr.nodes.length / 4));

        for (let idx = 0; idx < curr.nodes.length; idx += step) {
          const a = curr.nodes[idx];
          const bIdx = Math.floor((idx / curr.nodes.length) * next.nodes.length);
          const b = next.nodes[bIdx % next.nodes.length];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < radius * 0.5) {
            const avgZ = (a.z + b.z) / 2;
            const depthFade = (avgZ + 1) / 2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(100,180,240,${0.08 * depthFade})`;
            ctx.lineWidth = 0.35;
            ctx.stroke();
          }
        }
      }

      const allNodes: SphereNode[] = [];
      orbits.forEach((o) => allNodes.push(...o.nodes));
      const sorted = [...allNodes].sort((a, b) => a.z - b.z);

      sorted.forEach((n) => {
        const depthFade = (n.z + 1) / 2;
        const nodeR = 0.6 + depthFade * 1.0;
        const alpha = 0.3 + depthFade * 0.7;

        if (depthFade > 0.7) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, nodeR * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(140,210,255,${(depthFade - 0.7) * 0.15})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,235,255,${alpha})`;
        ctx.fill();
      });

      const pulse = 0.85 + Math.sin(t * 3) * 0.15;
      ctx.beginPath();
      ctx.arc(cx, cy, 3 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220,240,255,0.95)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 7 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(160,210,255,0.2)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 12 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(140,200,255,0.08)';
      ctx.fill();

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
