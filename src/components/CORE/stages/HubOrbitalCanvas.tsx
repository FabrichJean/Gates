import { useEffect, useRef } from "react";

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
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Get satellite elements to calculate their exact positions
    const getSatellitePosition = (satId: string): { x: number; y: number } | null => {
      const satElement = document.querySelector(`[data-satellite-id="${satId}"]`);
      if (!satElement || !canvas.parentElement) return null;

      const satRect = satElement.getBoundingClientRect();
      const canvasRect = canvas.parentElement.getBoundingClientRect();

      // Calculate relative position to canvas parent
      const x = satRect.left - canvasRect.left + satRect.width / 2;
      const y = satRect.top - canvasRect.top + satRect.height / 2;

      return { x, y };
    };

    let t = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

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

      // Connecting lines: satellites → center (STRAIGHT LINES)
      satellites.forEach((sat) => {
        const satPos = getSatellitePosition(sat.id);
        if (!satPos) return;

        const sx = satPos.x;
        const sy = satPos.y;

        // Create gradient for connecting line
        const grad = ctx.createLinearGradient(sx, sy, cx, cy);
        grad.addColorStop(0, sat.color + "00");
        grad.addColorStop(0.4, sat.color + "55");
        grad.addColorStop(1, sat.color + "20");

        // Draw straight line from satellite to center
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Connection points at satellites
      satellites.forEach((sat, i) => {
        const satPos = getSatellitePosition(sat.id);
        if (!satPos) return;

        const sx = satPos.x;
        const sy = satPos.y;

        // Draw connection point at satellite
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fillStyle = sat.color + "66";
        ctx.fill();

        // Draw orbiting dots around center
        const angle = t * 0.5 + i * ((Math.PI * 2) / 6);
        const orbitR = Math.min(w, h) * 0.3;
        const ox = cx + Math.cos(angle) * orbitR;
        const oy = cy + Math.sin(angle) * orbitR * 0.35;

        ctx.beginPath();
        ctx.arc(ox, oy, 2, 0, Math.PI * 2);
        ctx.fillStyle = sat.color + "aa";
        ctx.fill();
      });

      // Center glow
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
      grd.addColorStop(0, "rgba(100, 40, 180, 0.15)");
      grd.addColorStop(1, "rgba(100, 40, 180, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      t += 0.02;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [satellites]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};
