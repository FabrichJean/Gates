import { useEffect, useRef, useState } from 'react';
import type { CosmosConfig } from './types';

interface Particle {
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

interface TerrainVertex {
  bx: number;
  by: number;
  x: number;
  y: number;
  wave: number;
}

const DEFAULT_CONFIG: CosmosConfig = {
  particleCount: 30,
  nodeCount: 10,
  connectionDistance: 160,
  showParticles: true,
  showOrbits: true,
  showTerrain: true,
};

// ─── Orbit Sphere helpers ─────────────────────────────────────────────────────

function buildOrbitRings(): OrbitRing[] {
  const configs = [
    { inclination: 0, nodeCount: 18, rotationSpeed: 0.35 },
    { inclination: Math.PI / 3.5, nodeCount: 16, rotationSpeed: -0.28 },
    { inclination: -Math.PI / 4, nodeCount: 14, rotationSpeed: 0.32 },
    { inclination: Math.PI / 2.3, nodeCount: 12, rotationSpeed: -0.22 },
    { inclination: -Math.PI / 5.5, nodeCount: 16, rotationSpeed: 0.18 },
    { inclination: Math.PI / 7, nodeCount: 14, rotationSpeed: -0.25 },
  ];
  
  return configs.map(cfg => ({
    ...cfg,
    nodes: Array.from({ length: cfg.nodeCount }, (_, i) => ({
      ax: (i / cfg.nodeCount) * Math.PI * 2,
      ay: cfg.inclination,
      x: 0, y: 0, z: 0,
    })),
  }));
}

function projectOrbitRings(
  orbits: OrbitRing[],
  cx: number,
  cy: number,
  radius: number,
  rotX: number,
  rotY: number,
  t: number
) {
  orbits.forEach(orbit => {
    orbit.nodes.forEach(n => {
      const angle = n.ax + t * orbit.rotationSpeed;
      
      // Point sur cercle unité dans plan XY
      const lx = Math.cos(angle);
      const ly = Math.sin(angle);
      const lz = 0;
      
      // Rotation autour de X par inclinaison
      const cosI = Math.cos(orbit.inclination);
      const sinI = Math.sin(orbit.inclination);
      const rx = lx;
      const ry = ly * cosI - lz * sinI;
      const rz = ly * sinI + lz * cosI;
      
      // Rotation globale Y
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const px = rx * cosY - rz * sinY;
      const pz = rx * sinY + rz * cosY;
      
      // Rotation globale X
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const py = ry * cosX - pz * sinX;
      const pz2 = ry * sinX + pz * cosX;
      
      n.x = cx + px * radius;
      n.y = cy - py * radius;
      n.z = pz2;
    });
  });
}

// ─── Terrain helpers ──────────────────────────────────────────────────────────

function buildTerrain(
  cols: number,
  rows: number,
  w: number,
  h: number
): TerrainVertex[] {
  const vertices: TerrainVertex[] = [];
  const startY = h * 0.52;
  const endY = h * 1.05;

  for (let row = 0; row <= rows; row++) {
    const tRow = row / rows;
    const perspective = 0.35 + tRow * 0.65;

    for (let col = 0; col <= cols; col++) {
      const tCol = col / cols;
      const xSpan = w * (0.5 + perspective * 0.6);
      const bx = w * 0.5 - xSpan / 2 + tCol * xSpan;
      const by = startY + tRow * (endY - startY);

      vertices.push({
        bx,
        by,
        x: bx,
        y: by,
        wave: tCol * Math.PI * 2 + tRow * Math.PI * 1.2,
      });
    }
  }
  return vertices;
}

function animateTerrain(
  vertices: TerrainVertex[],
  cols: number,
  rows: number,
  t: number,
  h: number
) {
  const amplitude = h * 0.045;
  vertices.forEach((v, idx) => {
    const row = Math.floor(idx / (cols + 1));
    const tRow = row / rows;
    const waveAmp = amplitude * Math.sin(tRow * Math.PI);
    v.y = v.by + Math.sin(v.wave + t * 0.8) * waveAmp;
    v.x = v.bx;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CosmosCanvas: React.FC<{ config?: Partial<CosmosConfig> }> = ({
  config = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isInitializedRef = useRef(false);

  const particlesRef = useRef<Particle[]>([]);
  const orbitsRef = useRef<OrbitRing[]>([]);
  const terrainRef = useRef<TerrainVertex[]>([]);
  
  const TERRAIN_COLS = 24;
  const TERRAIN_ROWS = 10;

  // Terminal text state
  const [visibleLines, setVisibleLines] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [timerText, setTimerText] = useState("00:00");

  const terminalLines = [
    { text: "> INITIALIZING FABRICH SYSTEM...", delay: 0.3 },
    { text: "—", delay: 0.5 },
    { text: "LOADING UNIVERSE LAYERS...", delay: 1.2 },
    { text: "CORE STRUCTURE... OK", delay: 2.1, ok: true },
    { text: "INTERFACE LAYER... OK", delay: 3.0, ok: true },
    { text: "CONNECTING NODES...", delay: 3.9 },
    { text: "BUILDING VISUALS...", delay: 4.8 },
    { text: "SYSTEM STATUS: ONLINE", delay: 5.7, status: true },
  ];

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    terminalLines.forEach((line, idx) => {
      const t = setTimeout(() => {
        setVisibleLines(prev => Math.max(prev, idx + 1));
      }, line.delay + 500);
      timeouts.push(t);
    });

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    const timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const seconds = Math.floor(elapsed / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      setTimerText(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    }, 1000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(cursorInterval);
      clearInterval(timerInterval);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const PARTICLE_APPEAR_MS = 2500;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    if (!isInitializedRef.current) {
      startTimeRef.current = Date.now();

      particlesRef.current = Array.from({ length: finalConfig.particleCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 0.8 + 0.2,
        o: Math.random() * 0.2 + 0.05,
      }));

      orbitsRef.current = buildOrbitRings();

      terrainRef.current = buildTerrain(
        TERRAIN_COLS,
        TERRAIN_ROWS,
        canvas.width,
        canvas.height
      );

      isInitializedRef.current = true;
    }

    const particles = particlesRef.current;
    const orbits = orbitsRef.current;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const elapsed = Date.now() - startTimeRef.current;
      const t = elapsed / 1000;

      ctx.clearRect(0, 0, w, h);

      // ── 1. Dust particles ────────────────────────────────────────────────
      if (finalConfig.showParticles !== false) {
        particles.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;

          const particleStart = (idx / particles.length) * PARTICLE_APPEAR_MS;
          const fadeIn = Math.max(0, Math.min(1, (elapsed - particleStart) / 500));
          const smoothFade = fadeIn * fadeIn * (3 - 2 * fadeIn);

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(140,180,255,${p.o * smoothFade})`;
          ctx.fill();
        });
      }

      // ── 2. Orbital Sphere ────────────────────────────────────────────────
      if (finalConfig.showOrbits !== false) {
        const sphereCX = w * 0.72;
        const sphereCY = h * 0.30;
        const sphereR = w * 0.18;
        const rotY = t * 0.25;
        const rotX = t * 0.12;

        projectOrbitRings(orbits, sphereCX, sphereCY, sphereR, rotX, rotY, t);

        // Collect all nodes for z-sorting
        const allNodes: SphereNode[] = [];
        orbits.forEach(o => allNodes.push(...o.nodes));
        const sorted = [...allNodes].sort((a, b) => a.z - b.z);

        // Draw orbit rings
        orbits.forEach(orbit => {
          const nodes = orbit.nodes;
          for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            const b = nodes[(i + 1) % nodes.length];
            
            const avgZ = (a.z + b.z) / 2;
            const depthFade = (avgZ + 1) / 2;
            const alpha = 0.12 + depthFade * 0.55;
            
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(100,200,255,${alpha})`;
            ctx.lineWidth = 0.5 + depthFade * 0.5;
            ctx.stroke();
          }
        });

        // Draw cross-orbit connections
        for (let i = 0; i < orbits.length - 1; i++) {
          const curr = orbits[i];
          const next = orbits[i + 1];
          const step = Math.max(1, Math.floor(curr.nodes.length / 6));
          
          for (let idx = 0; idx < curr.nodes.length; idx += step) {
            const a = curr.nodes[idx];
            const bIdx = Math.floor((idx / curr.nodes.length) * next.nodes.length);
            const b = next.nodes[bIdx % next.nodes.length];
            
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            
            if (d < sphereR * 0.6) {
              const avgZ = (a.z + b.z) / 2;
              const depthFade = (avgZ + 1) / 2;
              
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(120,210,255,${0.12 * depthFade})`;
              ctx.lineWidth = 0.35;
              ctx.stroke();
            }
          }
        }

        // Draw sphere nodes
        sorted.forEach((n) => {
          const depthFade = (n.z + 1) / 2;
          const nodeR = 0.7 + depthFade * 1.2;
          const alpha = 0.35 + depthFade * 0.65;

          if (depthFade > 0.75) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, nodeR * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(120,200,255,${(depthFade - 0.75) * 0.2})`;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(n.x, n.y, nodeR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180,235,255,${alpha})`;
          ctx.fill();
        });

        // Central bright star
        const starPulse = 0.85 + Math.sin(t * 2.5) * 0.15;
        ctx.beginPath();
        ctx.arc(sphereCX, sphereCY, 3.5 * starPulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,245,255,0.95)`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(sphereCX, sphereCY, 8 * starPulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,220,255,0.18)`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(sphereCX, sphereCY, 14 * starPulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140,200,255,0.08)`;
        ctx.fill();
      }

      // ── 3. Terrain ───────────────────────────────────────────────────────
      if (finalConfig.showTerrain !== false) {
        animateTerrain(terrainRef.current, TERRAIN_COLS, TERRAIN_ROWS, t, h);
        const verts = terrainRef.current;
        const cols = TERRAIN_COLS;
        const rows = TERRAIN_ROWS;

        const terrainFade = Math.min(1, elapsed / 1800);

        for (let row = 0; row <= rows; row++) {
          for (let col = 0; col <= cols; col++) {
            const idx = row * (cols + 1) + col;
            const v = verts[idx];
            const tRow = row / rows;
            const depthBright = 0.12 + tRow * 0.48;

            // Horizontal
            if (col < cols) {
              const vr = verts[idx + 1];
              ctx.beginPath();
              ctx.moveTo(v.x, v.y);
              ctx.lineTo(vr.x, vr.y);
              ctx.strokeStyle = `rgba(90,170,255,${depthBright * terrainFade})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }

            // Vertical
            if (row < rows) {
              const vBelow = verts[(row + 1) * (cols + 1) + col];
              ctx.beginPath();
              ctx.moveTo(v.x, v.y);
              ctx.lineTo(vBelow.x, vBelow.y);
              ctx.strokeStyle = `rgba(70,150,230,${depthBright * 0.7 * terrainFade})`;
              ctx.lineWidth = 0.35;
              ctx.stroke();
            }

            // Diagonal
            if (row < rows && col < cols) {
              const vd = verts[(row + 1) * (cols + 1) + (col + 1)];
              ctx.beginPath();
              ctx.moveTo(v.x, v.y);
              ctx.lineTo(vd.x, vd.y);
              ctx.strokeStyle = `rgba(60,140,210,${depthBright * 0.5 * terrainFade})`;
              ctx.lineWidth = 0.3;
              ctx.stroke();
            }
          }
        }

        // Terrain vertex dots
        for (let row = 0; row <= rows; row++) {
          for (let col = 0; col <= cols; col++) {
            const idx = row * (cols + 1) + col;
            const v = verts[idx];
            const tRow = row / rows;
            const brightness = 0.15 + tRow * 0.55;
            const isBright = idx % 7 === 0;

            ctx.beginPath();
            ctx.arc(v.x, v.y, isBright ? 1.6 : 0.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${isBright ? '0,229,192' : '100,180,255'},${brightness * terrainFade})`;
            ctx.fill();
          }
        }
      }

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
      className="absolute top-0 left-0 w-full h-full"
    />
  );
};