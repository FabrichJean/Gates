import { useEffect, useRef, useState } from 'react';

interface CoreParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  o: number;
}

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

const CoreBgCanvas: React.FC = () => {
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

    const particles: CoreParticle[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      r: Math.random() * 0.6 + 0.2,
      o: Math.random() * 0.12 + 0.04,
    }));

    const scanlines = Array.from({ length: 8 }, () => ({
      y: Math.random() * canvas.height,
      speed: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.025 + 0.008,
    }));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const t = Date.now() / 1000;

      ctx.clearRect(0, 0, w, h);

      scanlines.forEach((sl) => {
        sl.y += sl.speed;
        if (sl.y < -1) sl.y = h + 1;
        if (sl.y > h + 1) sl.y = -1;
        ctx.beginPath();
        ctx.moveTo(0, sl.y);
        ctx.lineTo(w, sl.y);
        ctx.strokeStyle = `rgba(100,130,200,${sl.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const blink = 0.7 + Math.sin(t * 2 + p.x) * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,190,255,${p.o * blink})`;
        ctx.fill();
      });

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

const CoreSphereCanvas: React.FC = () => {
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
      ctx.fillStyle = `rgba(220,240,255,0.95)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 7 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(160,210,255,0.2)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 12 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(140,200,255,0.08)`;
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

interface CoreStageProps {
  onViewSystem?: () => void;
}

export const CoreStage: React.FC<CoreStageProps> = ({ onViewSystem }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex flex-col flex-1 h-full bg-black overflow-hidden rounded-lg border border-[#1a1a2e]">
      <CoreBgCanvas />

      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,30,0.08) 2px, rgba(0,0,30,0.08) 4px)',
          backgroundSize: '100% 4px',
        }}
      />

      <div className="relative z-10 flex items-center justify-between px-6 py-5 md:px-8 md:py-6">
        <div>
          <h1 className="font-mono text-sm text-[#a0a0c0] tracking-[0.15em] uppercase">Core</h1>
          <div className="w-6 h-[1px] bg-[#3a3a6a] mt-1.5" />
        </div>
        <div className="flex items-center gap-3">
          <button className="w-7 h-7 rounded-full border border-[#2a2a4a] flex items-center justify-center text-[#505070] hover:text-[#8080a0] hover:border-[#404060] transition-colors text-xs">
            ⓘ
          </button>
          <button className="w-7 h-7 rounded-full border border-[#2a2a4a] flex items-center justify-center text-[#505070] hover:text-[#8080a0] hover:border-[#404060] transition-colors text-xs">
            ⚙
          </button>
        </div>
      </div>

      <div className="flex-1 flex relative z-10 px-6 md:px-8 pb-6">
        <div
          className={`
            flex flex-col justify-center flex-1 transition-all duration-1000
            ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
          `}
        >
          <p className="font-mono text-sm text-[#b0b0c8] tracking-wide mb-1">Hello, explorer.</p>
          <p className="font-mono text-sm text-[#555] tracking-wide mb-8">
            Bienvenue dans le noyau.
          </p>

          <div className="space-y-4 font-mono text-[11px] tracking-[0.12em]">
            <div className="flex items-center justify-between w-56">
              <span className="text-[#555]">STATUS</span>
              <span className="text-[#777]">C-0.95</span>
            </div>
            <div className="flex items-center justify-between w-56">
              <span className="text-[#555]">FOCUS MODE</span>
              <span className="text-[#777]">—</span>
            </div>
            <div className="flex items-center justify-between w-56">
              <span className="text-[#555]"></span>
              <span className="text-emerald-400">Building Guardian System</span>
            </div>
          </div>

          <button
            onClick={onViewSystem}
            className="
              mt-8 font-mono text-[11px] text-[#7070cc] tracking-[0.2em]
              border border-[#2a2a5a] bg-[#0a0a1a]
              px-6 py-2.5 rounded-sm w-fit
              hover:bg-[#0f0f2a] hover:text-[#aaaaff] hover:border-[#404080]
              transition-all duration-300 cursor-pointer
            "
          >
            VIEW SYSTEM
          </button>
        </div>

        <div
          className={`
            absolute right-6 top-1/2 -translate-y-1/2
            w-36 h-36 md:w-44 md:h-44
            transition-all duration-1000 delay-300
            ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
        >
          <CoreSphereCanvas />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 py-4 md:px-8 border-t border-[#111122]">
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 rounded border border-[#1a1a3a] flex items-center justify-center text-[#404060] hover:text-[#606080] hover:border-[#2a2a5a] transition-colors text-xs">
            □
          </button>
          <button className="w-8 h-8 rounded border border-[#1a1a3a] flex items-center justify-center text-[#404060] hover:text-[#606080] hover:border-[#2a2a5a] transition-colors text-xs">
            ○
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 rounded border border-[#1a1a3a] flex items-center justify-center text-[#404060] hover:text-[#606080] hover:border-[#2a2a5a] transition-colors text-xs">
            ◉
          </button>
          <button className="w-8 h-8 rounded border border-[#1a1a3a] flex items-center justify-center text-[#404060] hover:text-[#606080] hover:border-[#2a2a5a] transition-colors text-xs">
            ◯
          </button>
          <button className="w-8 h-8 rounded border border-[#1a1a3a] flex items-center justify-center text-[#404060] hover:text-[#606080] hover:border-[#2a2a5a] transition-colors text-xs">
            ◎
          </button>
        </div>
      </div>

      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[#2a2a4a] opacity-30" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[#2a2a4a] opacity-30" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[#2a2a4a] opacity-30" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[#2a2a4a] opacity-30" />
    </div>
  );
};
