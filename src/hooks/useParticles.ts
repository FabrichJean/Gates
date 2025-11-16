import { useEffect } from "react";
import type { RefObject } from "react";

type MouseRef = RefObject<{ x: number; y: number }>;

type Options = {
  isDark?: boolean;
  minCount?: number;
  density?: number; // per px^2
  color?: string;
  centerBoost?: number; // how much alpha to add at center
};

export default function useParticles(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLElement | null>,
  mouseRef: MouseRef,
  opts: Options = {}
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const el = containerRef.current;
    if (!canvas || !el) return;

  const color = opts.color || "59,130,246"; // rgb
    const minCount = opts.minCount ?? 200;
    const density = opts.density ?? 0.005;
    const centerBoost = opts.centerBoost ?? 0.18;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const e = el as HTMLDivElement;
    const c = canvas as HTMLCanvasElement;
    const ctx2 = ctx as CanvasRenderingContext2D;

    const dpr = window.devicePixelRatio || 1;
    function resize() {
      const w = Math.max(1, e.clientWidth);
      const h = Math.max(1, e.clientHeight);
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(e);

    const area = e.clientWidth * e.clientHeight;
    const count = Math.max(minCount, Math.floor(area * density));

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; a: number };
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * e.clientWidth,
        y: Math.random() * e.clientHeight,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        size: 0.3 + Math.random() * 0.8,
        a: 0.04 + Math.random() * 0.06,
      });
    }

    let animId = 0;

    function step() {
      if (!ctx2) return;
      ctx2.clearRect(0, 0, e.clientWidth, e.clientHeight);

      const mx = mouseRef.current?.x ?? -9999;
      const my = mouseRef.current?.y ?? -9999;

      const cx = e.clientWidth / 2;
      const cy = e.clientHeight / 2;
      const maxCenter = Math.min(e.clientWidth, e.clientHeight) * 0.5;

      for (let p of particles) {
        if (mx > -1000) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const max = 70;
          if (dist < max) {
            const force = (1 - dist / max) * 0.6;
            p.vx += (dx / dist) * force * 0.4;
            p.vy += (dy / dist) * force * 0.4;
          }
        }

        p.vx += (Math.random() - 0.5) * 0.005;
        p.vy += (Math.random() - 0.5) * 0.005;

        p.vx *= 0.992;
        p.vy *= 0.992;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x += e.clientWidth;
        if (p.x > e.clientWidth) p.x -= e.clientWidth;
        if (p.y < 0) p.y += e.clientHeight;
        if (p.y > e.clientHeight) p.y -= e.clientHeight;

        const dxC = p.x - cx;
        const dyC = p.y - cy;
        const dCenter = Math.hypot(dxC, dyC);
        const influence = Math.max(0, 1 - dCenter / maxCenter);

        const drawSize = p.size * (1 + influence * 1.6);
        const drawAlpha = Math.min(1, p.a + influence * centerBoost);

        ctx2.beginPath();
        ctx2.fillStyle = `rgba(${color},${drawAlpha})`;
        ctx2.globalAlpha = 1;
        ctx2.arc(p.x, p.y, drawSize, 0, Math.PI * 2);
        ctx2.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 225) {
            const alpha = 0.045 * (1 - d2 / 225);
            ctx2.beginPath();
            ctx2.strokeStyle = `rgba(${color},${alpha})`;
            ctx2.lineWidth = 0.3;
            ctx2.moveTo(a.x, a.y);
            ctx2.lineTo(b.x, b.y);
            ctx2.stroke();
          }
        }
      }

      animId = requestAnimationFrame(step);
    }

    step();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      ctx2.clearRect(0, 0, c.width, c.height);
    };
  }, [canvasRef, containerRef, mouseRef, opts.isDark, opts.minCount, opts.density, opts.color, opts.centerBoost]);
}
