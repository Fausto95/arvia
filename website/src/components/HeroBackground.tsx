import { useEffect, useRef } from "react";
import { useSiteTheme } from "../site-theme";

type Orb = {
  x: number;
  y: number;
  radius: number;
  hue: number;
  phase: number;
  speed: number;
};

type Thread = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  phase: number;
  speed: number;
};

function readAccentRgb(): [number, number, number] {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--arvia-color-accent")
    .trim();
  if (raw.startsWith("#") && raw.length >= 7) {
    return [
      parseInt(raw.slice(1, 3), 16),
      parseInt(raw.slice(3, 5), 16),
      parseInt(raw.slice(5, 7), 16),
    ];
  }
  return [79, 70, 229];
}

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useSiteTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let raf = 0;

    const orbs: Orb[] = [
      { x: 0.22, y: 0.35, radius: 0.42, hue: 0, phase: 0, speed: 0.35 },
      { x: 0.78, y: 0.28, radius: 0.38, hue: 0.12, phase: 1.4, speed: 0.28 },
      { x: 0.55, y: 0.72, radius: 0.45, hue: -0.08, phase: 2.6, speed: 0.22 },
      { x: 0.35, y: 0.58, radius: 0.32, hue: 0.2, phase: 4.1, speed: 0.31 },
    ];

    const threads: Thread[] = Array.from({ length: 14 }, (_, i) => ({
      x1: (i * 0.13 + 0.05) % 1,
      y1: 0.12 + (i % 5) * 0.08,
      x2: (i * 0.17 + 0.35) % 1,
      y2: 0.55 + (i % 4) * 0.1,
      phase: i * 0.9,
      speed: 0.15 + (i % 3) * 0.05,
    }));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawGrid = (t: number, accent: [number, number, number], dark: boolean) => {
      const spacing = 48;
      const offsetX = (t * 12) % spacing;
      const offsetY = (t * 8) % spacing;
      const lineAlpha = dark ? 0.07 : 0.05;

      ctx.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${lineAlpha})`;
      ctx.lineWidth = 1;

      for (let x = -spacing; x < width + spacing; x += spacing) {
        const wave = Math.sin(t * 0.4 + x * 0.008) * 6;
        ctx.beginPath();
        ctx.moveTo(x + offsetX, 0);
        ctx.lineTo(x + offsetX + wave, height);
        ctx.stroke();
      }

      for (let y = -spacing; y < height + spacing; y += spacing) {
        const wave = Math.cos(t * 0.35 + y * 0.01) * 5;
        ctx.beginPath();
        ctx.moveTo(0, y + offsetY);
        ctx.lineTo(width, y + offsetY + wave);
        ctx.stroke();
      }
    };

    const drawOrbs = (t: number, accent: [number, number, number], dark: boolean) => {
      for (const orb of orbs) {
        const cx =
          (orb.x + Math.sin(t * orb.speed + orb.phase) * 0.08 + Math.cos(t * 0.15) * 0.03) * width;
        const cy =
          (orb.y + Math.cos(t * orb.speed * 0.9 + orb.phase) * 0.1 + Math.sin(t * 0.12) * 0.04) *
          height;
        const r = orb.radius * Math.min(width, height);

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const alpha = dark ? 0.55 : 0.38;
        gradient.addColorStop(0, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${alpha})`);
        gradient.addColorStop(
          0.45,
          `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${dark ? 0.18 : 0.12})`,
        );
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawThreads = (t: number, accent: [number, number, number], dark: boolean) => {
      for (const thread of threads) {
        const pulse = (Math.sin(t * thread.speed + thread.phase) + 1) * 0.5;
        const x1 = (thread.x1 + Math.sin(t * 0.2 + thread.phase) * 0.04) * width;
        const y1 = (thread.y1 + Math.cos(t * 0.25 + thread.phase) * 0.05) * height;
        const x2 = (thread.x2 + Math.cos(t * 0.18 + thread.phase) * 0.05) * width;
        const y2 = (thread.y2 + Math.sin(t * 0.22 + thread.phase) * 0.06) * height;

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        const a = (dark ? 0.35 : 0.28) * (0.35 + pulse * 0.65);
        gradient.addColorStop(0, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0)`);
        gradient.addColorStop(0.5, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${a})`);
        gradient.addColorStop(1, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1 + pulse * 1.2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(
          (x1 + x2) / 2 + Math.sin(t + thread.phase) * 40,
          (y1 + y2) / 2 - 30,
          (x1 + x2) / 2 - Math.cos(t * 0.8) * 35,
          (y1 + y2) / 2 + 20,
          x2,
          y2,
        );
        ctx.stroke();

        ctx.fillStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${a * 1.4})`;
        ctx.beginPath();
        ctx.arc(x1, y1, 2 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x2, y2, 2 + pulse, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawVignette = (dark: boolean) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, dark ? "rgba(9, 9, 11, 0)" : "rgba(244, 244, 245, 0)");
      gradient.addColorStop(0.55, dark ? "rgba(9, 9, 11, 0.15)" : "rgba(244, 244, 245, 0.2)");
      gradient.addColorStop(1, dark ? "rgba(9, 9, 11, 0.95)" : "rgba(244, 244, 245, 0.98)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    const paint = (t: number) => {
      const accent = readAccentRgb();
      const dark = theme === "dark";

      ctx.clearRect(0, 0, width, height);
      drawGrid(t, accent, dark);
      drawOrbs(t, accent, dark);
      drawThreads(t, accent, dark);
      drawVignette(dark);
    };

    const loop = () => {
      frame += reducedMotion ? 0 : 0.016;
      paint(frame);
      raf = requestAnimationFrame(loop);
    };

    resize();
    paint(frame);
    if (!reducedMotion) loop();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}
