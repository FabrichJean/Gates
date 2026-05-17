import { useEffect, useRef } from 'react';

interface CorePortraitCanvasProps {
  portraitImage?: string;
}

export const CorePortraitCanvas: React.FC<CorePortraitCanvasProps> = ({ portraitImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const ringAnimFrameRef = useRef<number | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Load portrait image if provided
    if (portraitImage) {
      const img = new Image();
      img.src = portraitImage;
      img.onload = () => {
        imageRef.current = img;
      };
    }
  }, [portraitImage]);

  useEffect(() => {
    // Ring canvas animation
    const ringCanvas = ringCanvasRef.current;
    if (ringCanvas) {
      const ctx = ringCanvas.getContext('2d');
      if (ctx) {
        let t = 0;

        const resize = () => {
          ringCanvas.width = ringCanvas.offsetWidth;
          ringCanvas.height = ringCanvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const drawRings = () => {
          const w = ringCanvas.width;
          const h = ringCanvas.height;
          const cx = w / 2;
          const cy = h / 2;
          ctx.clearRect(0, 0, w, h);

          // Ring 1 — tight around portrait (solid, glowing)
          const r1 = Math.min(w, h) * 0.37;
          ctx.beginPath();
          ctx.arc(cx, cy, r1, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(140,90,220,0.60)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // Glow layer for ring1
          ctx.beginPath();
          ctx.arc(cx, cy, r1, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(120,70,200,0.20)';
          ctx.lineWidth = 5;
          ctx.stroke();

          // Ring 2 — slightly outside, dashed
          const r2 = Math.min(w, h) * 0.44;
          ctx.save();
          ctx.setLineDash([5, 12]);
          ctx.beginPath();
          ctx.arc(cx, cy, r2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(90,65,160,0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          // Rotating subtle arc segments on ring2
          const segCount = 6;
          for (let i = 0; i < segCount; i++) {
            const baseA = (i / segCount) * Math.PI * 2 + t * 0.3;
            ctx.save();
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(cx, cy, r2, baseA, baseA + 0.3);
            ctx.strokeStyle = `rgba(150,100,255,${0.3 + Math.sin(t * 1.5 + i) * 0.2})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
          }

          t += 0.016;
          ringAnimFrameRef.current = requestAnimationFrame(drawRings);
        };

        drawRings();

        return () => {
          window.removeEventListener('resize', resize);
          if (ringAnimFrameRef.current) cancelAnimationFrame(ringAnimFrameRef.current);
        };
      }
    }
  }, []);

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
      const t = Date.now() / 1000;
      const cx = w * 0.5;
      const cy = h * 0.5;

      ctx.clearRect(0, 0, w, h);

      // Draw SVG portrait as path (side profile silhouette)
      drawPortraitSilhouette(ctx, w, h, t);

      // Consciousness field - breathing glow
      const breathe = 0.8 + Math.sin(t * 0.8) * 0.25;
      const coreRadius = Math.min(w, h) * 0.15 * breathe;

      // Multiple glow layers (consciousness field)
      const glowLayers = [
        { radius: coreRadius * 3.5, opacity: 0.08, color: [120, 80, 200] },
        { radius: coreRadius * 3, opacity: 0.12, color: [100, 60, 180] },
        { radius: coreRadius * 2.5, opacity: 0.15, color: [150, 100, 255] },
        { radius: coreRadius * 2, opacity: 0.18, color: [120, 80, 200] },
      ];

      glowLayers.forEach((layer) => {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, layer.radius);
        const [r, g, b] = layer.color;
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${layer.opacity})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, layer.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Pulsing core border
      const glowIntensity = 0.4 + Math.sin(t * 1.5) * 0.35;
      ctx.strokeStyle = `rgba(200, 150, 255, ${glowIntensity})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner concentric rings
      [1.5, 2.2, 2.9].forEach((ringMultiplier, idx) => {
        const ringRadius = coreRadius * ringMultiplier;
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 150, 200, ${0.08 - idx * 0.02})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Orbiting consciousness particles
      const particleCount = 16;
    //   for (let i = 0; i < particleCount; i++) {
    //     const angle = (i / particleCount) * Math.PI * 2 + t * 0.6;
    //     const distance = coreRadius * 1.8;
    //     const px = cx + Math.cos(angle) * distance;
    //     const py = cy + Math.sin(angle) * distance;

    //     const particleSize = 2 + Math.sin(t * 2.5 + i * 0.3) * 1.2;
    //     const opacity = 0.5 + Math.sin(t * 1.8 + i * 0.4) * 0.35;
    //     ctx.beginPath();
    //     ctx.arc(px, py, particleSize, 0, Math.PI * 2);
    //     ctx.fillStyle = `rgba(180, 150, 255, ${opacity})`;
    //     ctx.fill();
    //   }

      // Synaptic connections - neural net pattern
      for (let i = 0; i < particleCount; i++) {
        const angle1 = (i / particleCount) * Math.PI * 2 + t * 0.6;
        const angle2 = ((i + 3) / particleCount) * Math.PI * 2 + t * 0.6;
        const distance = coreRadius * 1.8;

        const x1 = cx + Math.cos(angle1) * distance;
        const y1 = cy + Math.sin(angle1) * distance;
        const x2 = cx + Math.cos(angle2) * distance;
        const y2 = cy + Math.sin(angle2) * distance;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(150, 120, 200, ${0.1 + Math.sin(t * 1 + i) * 0.08})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      // Center core pulse
      const pulse = 0.7 + Math.sin(t * 2.2) * 0.25;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 0.3 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(240, 220, 255, 0.8)';
      ctx.fill();

      // Draw portrait image on top if provided
      if (imageRef.current && imageRef.current.complete) {
        drawPortraitImage(ctx, w, h, imageRef.current);
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
    <div className="relative w-full h-full">
      <canvas ref={ringCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

// Draw the stylized profile silhouette
function drawPortraitSilhouette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number
) {
  const cx = w * 0.5;
  const cy = h * 0.5;

  // Background nebula - blended with hub background
  const nebula = ctx.createRadialGradient(
    cx + w * 0.1,
    cy - h * 0.15,
    0,
    cx,
    cy,
    Math.max(w, h) * 0.35
  );
  nebula.addColorStop(0, 'rgba(120, 100, 200, 0.25)');
  nebula.addColorStop(0.3, 'rgba(60, 50, 120, 0.15)');
  nebula.addColorStop(1, 'rgba(10, 10, 21, 0.05)');
  ctx.fillStyle = nebula;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(w, h) * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Moon glow - subtle accent light
  const moonGlow = ctx.createRadialGradient(
    cx + w * 0.12,
    cy - h * 0.18,
    0,
    cx + w * 0.12,
    cy - h * 0.18,
    Math.min(w, h) * 0.22
  );
  moonGlow.addColorStop(0, 'rgba(150, 120, 220, 0.35)');
  moonGlow.addColorStop(0.5, 'rgba(80, 60, 150, 0.15)');
  moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(
    cx + w * 0.12,
    cy - h * 0.18,
    Math.min(w, h) * 0.22,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Profile silhouette (stylized, side view looking right)
  ctx.save();
  ctx.fillStyle = 'rgba(8, 4, 24, 0.9)';
  ctx.filter = 'blur(3px)';

  // Afro hair
  ctx.beginPath();
  ctx.ellipse(cx + w * 0.05, cy - h * 0.15, w * 0.12, h * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face profile
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.15, cy - h * 0.08);
  ctx.bezierCurveTo(
    cx + w * 0.18,
    cy,
    cx + w * 0.18,
    cy + h * 0.08,
    cx + w * 0.15,
    cy + h * 0.15
  );
  ctx.lineTo(cx - w * 0.05, cy + h * 0.17);
  ctx.bezierCurveTo(cx - w * 0.08, cy + h * 0.1, cx - w * 0.08, cy, cx - w * 0.05, cy - h * 0.08);
  ctx.closePath();
  ctx.fill();

  // Neck and hoodie
  ctx.fillRect(cx - w * 0.08, cy + h * 0.12, w * 0.16, h * 0.2);

  ctx.restore();

  // Subtle purple light on cheek
  const cheekGlow = ctx.createRadialGradient(
    cx + w * 0.12,
    cy + h * 0.02,
    0,
    cx + w * 0.12,
    cy + h * 0.02,
    w * 0.08
  );
  cheekGlow.addColorStop(0, 'rgba(80, 30, 160, 0.25)');
  cheekGlow.addColorStop(1, 'rgba(80, 30, 160, 0)');
  ctx.fillStyle = cheekGlow;
  ctx.beginPath();
  ctx.ellipse(cx + w * 0.12, cy + h * 0.02, w * 0.08, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Small stars
  ctx.fillStyle = 'rgba(200, 190, 255, 0.6)';
  const starPositions = [
    [cx - w * 0.15, cy - h * 0.15],
    [cx + w * 0.2, cy - h * 0.1],
    [cx - w * 0.2, cy + h * 0.05],
    [cx + w * 0.18, cy + h * 0.12],
  ];
  starPositions.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, w * 0.008, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Draw portrait image as circular mask
function drawPortraitImage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  image: HTMLImageElement
) {
  const cx = w * 0.5;
  const cy = h * 0.5;
  const portraitRadius = Math.min(w, h) * 0.25;

  ctx.save();

  // Create circular clipping path
  ctx.beginPath();
  ctx.arc(cx, cy, portraitRadius, 0, Math.PI * 2);
  ctx.clip();

  // Draw image centered in circle
  const imgAspect = image.width / image.height;
  const circleAspect = 1;
  let drawWidth = portraitRadius * 2;
  let drawHeight = portraitRadius * 2;

  if (imgAspect > circleAspect) {
    drawWidth = portraitRadius * 2 * imgAspect;
  } else {
    drawHeight = portraitRadius * 2 / imgAspect;
  }

  ctx.drawImage(
    image,
    cx - drawWidth / 2,
    cy - drawHeight / 2,
    drawWidth,
    drawHeight
  );

  // Add subtle vignette effect at edges
  const vignetteGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, portraitRadius);
  vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignetteGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
  vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  ctx.fillStyle = vignetteGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, portraitRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
