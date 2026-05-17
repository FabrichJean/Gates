import { useEffect, useRef } from 'react';

export const CosmicClouds: React.FC = () => {
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

    // Perlin-like noise for organic cloud shapes
    const generateNoise = (x: number, y: number, seed: number): number => {
      const n =
        Math.sin(x * 0.1 + y * 0.05 + seed) * 0.5 +
        Math.sin(x * 0.05 - y * 0.1 + seed * 1.3) * 0.3 +
        Math.sin((x + y) * 0.02 + seed * 0.8) * 0.2;
      return (n + 1.5) / 3;
    };

    let t = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Clear with slight fade for motion trails
      ctx.fillStyle = 'rgba(10, 10, 21, 0.85)';
      ctx.fillRect(0, 0, w, h);

      // Draw multiple layers of cosmic clouds
      const cloudLayers = [
        {
          offsetX: 50,
          offsetY: 30,
          scale: 0.8,
          color: [120, 80, 200], // Purple
          opacity: 0.08,
          speed: 0.0005,
        },
        {
          offsetX: 100,
          offsetY: 80,
          scale: 1.2,
          color: [80, 120, 200], // Blue
          opacity: 0.06,
          speed: 0.0003,
        },
        {
          offsetX: 20,
          offsetY: 60,
          scale: 1.5,
          color: [100, 150, 200], // Light blue
          opacity: 0.05,
          speed: 0.0002,
        },
      ];

      cloudLayers.forEach((layer, layerIdx) => {
        const noiseScale = 80 * layer.scale;
        const timeOffset = t * layer.speed;

        // Create noise-based cloud pattern
        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const pixelIdx = i / 4;
          const px = pixelIdx % w;
          const py = Math.floor(pixelIdx / w);

          const nx = (px + layer.offsetX + timeOffset) / noiseScale;
          const ny = (py + layer.offsetY) / noiseScale;

          const noiseValue = generateNoise(nx, ny, layerIdx * 100);
          const threshold = 0.35 + Math.sin(t * 0.0005 + layerIdx) * 0.05;

          if (noiseValue > threshold) {
            const intensity =
              (noiseValue - threshold) / (1 - threshold);
            const [r, g, b] = layer.color;

            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
            data[i + 3] = Math.floor(intensity * layer.opacity * 255);
          } else {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
      });

      // Add radial glow in the center
      const centerGradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6);
      centerGradient.addColorStop(0, 'rgba(150, 120, 220, 0.08)');
      centerGradient.addColorStop(0.5, 'rgba(100, 80, 180, 0.03)');
      centerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGradient;
      ctx.fillRect(0, 0, w, h);

      t++;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};
