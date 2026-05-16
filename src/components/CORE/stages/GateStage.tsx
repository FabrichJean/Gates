import { useEffect, useRef, useState } from 'react';
import { CosmosCanvas } from '../CosmosCanvas';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SideFragment {
  x: number;
  y: number;
  vx: number;
  length: number;
  opacity: number;
  side: 'left' | 'right';
}

interface ArcNode {
  angle: number;
  x: number;
  y: number;
  z: number;
}

interface GrainDot {
  x: number;
  y: number;
  r: number;
  o: number;
  blinkSpeed: number;
  phase: number;
}

interface Scanline {
  y: number;
  speed: number;
  opacity: number;
}

// ─── Canvas Component ───────────────────────────────────────────────────────

const GateCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const fragmentsRef = useRef<SideFragment[]>([]);
  const arcNodesRef = useRef<ArcNode[]>([]);
  const grainRef = useRef<GrainDot[]>([]);
  const scanlinesRef = useRef<Scanline[]>([]);

  const ARC_NODE_COUNT = 28;
  const FRAGMENT_COUNT = 18;
  const GRAIN_COUNT = 120;

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

    // Side fragments — short horizontal glitch lines on edges
    fragmentsRef.current = Array.from({ length: FRAGMENT_COUNT }, () => {
      const side = Math.random() > 0.5 ? 'left' : 'right';
      return {
        x: side === 'left' ? Math.random() * w * 0.25 : w * 0.75 + Math.random() * w * 0.25,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        length: Math.random() * 18 + 4,
        opacity: Math.random() * 0.25 + 0.08,
        side,
      };
    });

    // Arc nodes — very subtle top arc
    arcNodesRef.current = Array.from({ length: ARC_NODE_COUNT }, (_, i) => ({
      angle: (i / (ARC_NODE_COUNT - 1)) * Math.PI,
      x: 0,
      y: 0,
      z: 0,
    }));

    // Grain dots — tiny specks everywhere
    grainRef.current = Array.from({ length: GRAIN_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 0.7 + 0.15,
      o: Math.random() * 0.18 + 0.04,
      blinkSpeed: Math.random() * 2 + 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

    // Scanlines
    scanlinesRef.current = Array.from({ length: 10 }, () => ({
      y: Math.random() * h,
      speed: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.035 + 0.008,
    }));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const elapsed = Date.now() - startTimeRef.current;
      const t = elapsed / 1000;

      ctx.clearRect(0, 0, w, h);

      // ── 1. Scanlines (very subtle full-width) ───────────────────────────
      scanlinesRef.current.forEach((sl) => {
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

      // ── 2. Portal Arc (extremely subtle, almost ghost-like) ─────────────
      const arcCX = w * 0.5;
      const arcCY = h * 0.22;
      const arcR = Math.min(w, h) * 0.30;
      const rotation = t * 0.08; // very slow

      const nodes = arcNodesRef.current;
      nodes.forEach((n) => {
        const a = n.angle + rotation;
        const tilt = 0.2;
        const px = Math.cos(a);
        const py = Math.sin(a) * Math.cos(tilt);
        const pz = Math.sin(a) * Math.sin(tilt);

        n.x = arcCX + px * arcR;
        n.y = arcCY - py * arcR;
        n.z = pz;
      });

      // Arc connections — extremely faint
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        const avgZ = (a.z + b.z) / 2;
        const depthFade = (avgZ + 1) / 2;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(130,180,255,${0.06 + depthFade * 0.14})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      // Very sparse cross-chords
      for (let i = 0; i < nodes.length; i += 5) {
        for (let j = i + 6; j < nodes.length; j += 6) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < arcR * 0.5) {
            const avgZ = (a.z + b.z) / 2;
            const depthFade = (avgZ + 1) / 2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(120,170,240,${0.03 * depthFade})`;
            ctx.lineWidth = 0.3;
            ctx.stroke();
          }
        }
      }

      // Tiny arc nodes — barely visible
      const sorted = [...nodes].sort((a, b) => a.z - b.z);
      sorted.forEach((n) => {
        const depthFade = (n.z + 1) / 2;
        const nodeR = 0.5 + depthFade * 0.8;
        const alpha = 0.2 + depthFade * 0.4;

        ctx.beginPath();
        ctx.arc(n.x, n.y, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,230,255,${alpha})`;
        ctx.fill();
      });

      // Central micro-glow
      const pulse = 0.9 + Math.sin(t * 1.5) * 0.1;
      ctx.beginPath();
      ctx.arc(arcCX, arcCY, 2.5 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,240,255,0.6)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(arcCX, arcCY, 6 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(160,210,255,0.06)`;
      ctx.fill();

      // ── 3. Side fragments — broken horizontal lines on edges ────────────
      fragmentsRef.current.forEach((f) => {
        f.x += f.vx;
        if (f.side === 'left' && f.x > w * 0.3) f.x = -20;
        if (f.side === 'right' && f.x < w * 0.7) f.x = w + 20;

        // Flicker effect
        const flicker = 0.7 + Math.sin(t * 3 + f.y) * 0.3;

        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x + f.length, f.y);
        ctx.strokeStyle = `rgba(140,170,230,${f.opacity * flicker})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Occasional double line (glitch echo)
        if (Math.random() > 0.95) {
          ctx.beginPath();
          ctx.moveTo(f.x, f.y + 2);
          ctx.lineTo(f.x + f.length * 0.6, f.y + 2);
          ctx.strokeStyle = `rgba(120,160,220,${f.opacity * flicker * 0.5})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      });

      // ── 4. Grain dots — tiny specks everywhere ───────────────────────────
      grainRef.current.forEach((g) => {
        const blink = 0.5 + Math.sin(t * g.blinkSpeed + g.phase) * 0.5;

        ctx.beginPath();
        ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,190,255,${g.o * blink})`;
        ctx.fill();
      });

      // ── 5. Edge vignette ────────────────────────────────────────────────
      const edgeGrad = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.85);
      edgeGrad.addColorStop(0, 'rgba(0,0,0,0)');
      edgeGrad.addColorStop(1, 'rgba(0,0,10,0.5)');
      ctx.fillStyle = edgeGrad;
      ctx.fillRect(0, 0, w, h);

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
      className="absolute inset-0 w-full h-full"
      style={{ filter: 'contrast(1.05) brightness(0.95)' }}
    />
  );
};

// ─── GateStage Component ────────────────────────────────────────────────────

interface GateStageProps {
  onEnter?: () => void;
}

export const GateStage: React.FC<GateStageProps> = ({ onEnter }) => {
  const [timerText, setTimerText] = useState('00:00');
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const seconds = Math.floor(elapsed / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      setTimerText(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setContentVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex flex-col flex-1 h-full bg-black overflow-hidden rounded-lg border border-[#1a1a2e]">
      {/* CosmosCanvas background - only terrain, blurred and faded */}
      <CosmosCanvas config={{ particleCount: 0, nodeCount: 0, connectionDistance: 160, showParticles: true, showOrbits: true, showTerrain: true }} />

      {/* CSS scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,30,0.12) 2px, rgba(0,0,30,0.12) 4px)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Center content */}
      <div
        className={`
          flex-1 flex flex-col items-center justify-center gap-2 text-center 
          relative z-10 transition-all duration-1000 ease-out
          ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        <div className="h-14 md:h-18" />

        <h1 className="font-mono text-[28px] md:text-[32px] font-bold text-[#e0e0f0] tracking-[0.18em] uppercase">
          The System
        </h1>

        <p className="font-mono text-[11px] md:text-xs text-[#5050a0] tracking-[0.25em] mt-0.5">
          DEVELOPER &nbsp;•&nbsp; BUILDER &nbsp;•&nbsp; EXPLORER
        </p>

        <p className="font-mono text-[11px] md:text-xs text-[#555] tracking-[0.15em] leading-relaxed mt-3">
          A LIVING ECOSYSTEM OF<br />
          IDEAS, PROJECTS AND EXPERIMENTS.
        </p>

        <button
          onClick={onEnter}
          className="
            font-mono border border-[#3a3a7c] text-[#7070cc] text-xs 
            px-8 py-3.5 rounded-sm w-60 text-center tracking-[0.2em] mt-5 
            cursor-pointer bg-transparent 
            hover:bg-[#0a0a24] hover:text-[#aaaaff] hover:border-[#5050a0] 
            hover:shadow-[0_0_20px_rgba(80,80,160,0.15)]
            transition-all duration-300 text-nowrap
          "
        >
          <span className="mr-2 text-[#5050a0]">&gt;</span>
          ENTER THE SYSTEM
        </button>
      </div>

      {/* Bottom timer */}
      <div className="absolute bottom-5 left-6 md:bottom-8 md:left-10 z-10">
        <span className="font-mono text-[11px] text-[#444] tracking-wider">
          {timerText}
        </span>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-5 h-5 border-t border-l border-[#2a2a4a] opacity-30" />
      <div className="absolute top-4 right-4 w-5 h-5 border-t border-r border-[#2a2a4a] opacity-30" />
      <div className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-[#2a2a4a] opacity-30" />
      <div className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-[#2a2a4a] opacity-30" />
    </div>
  );
};