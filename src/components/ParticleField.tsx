import { useEffect, useRef } from "react";

const COLORS = ["#00f5ff", "#7b2fff", "#ff2d78", "#00ff94", "#ffffff20"];
const PARTICLE_COUNT = 200;
const INFLUENCE_RADIUS = 180;
const REPULSION_RADIUS = 30;
const DECAY_MS = 1500;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  alpha: number;
};

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999, lastMove: 0, active: false };
    let raf = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const seed = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () => {
        const angle = rand(0, Math.PI * 2);
        const speed = rand(0.3, 1.2);
        return {
          x: rand(0, width),
          y: rand(0, height),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          w: rand(3, 8),
          h: rand(2, 3),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: rand(0.5, 0.8),
        };
      });
    };

    const onMove = (x: number, y: number) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = x - rect.left;
      mouse.y = y - rect.top;
      mouse.lastMove = performance.now();
      mouse.active = true;
    };

    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      const now = performance.now();
      const sinceMove = now - mouse.lastMove;
      const decay = mouse.active ? Math.max(0, 1 - sinceMove / DECAY_MS) : 0;

      for (const p of particles) {
        if (decay > 0) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          if (dist < INFLUENCE_RADIUS) {
            const tStrength = 0.03 * decay;
            if (dist < REPULSION_RADIUS) {
              // push outward
              const push = (REPULSION_RADIUS - dist) / REPULSION_RADIUS;
              p.vx -= (dx / dist) * push * 0.6 * decay;
              p.vy -= (dy / dist) * push * 0.6 * decay;
            } else {
              const falloff = 1 - dist / INFLUENCE_RADIUS;
              p.vx += dx * tStrength * falloff * 0.05;
              p.vy += dy * tStrength * falloff * 0.05;
              // also direct ease toward target
              p.x += dx * tStrength * falloff;
              p.y += dy * tStrength * falloff;
            }
          }
        }

        p.vx *= 0.98;
        p.vy *= 0.98;

        // ensure minimum drift
        const sp = Math.hypot(p.vx, p.vy);
        if (sp < 0.3) {
          const a = rand(0, Math.PI * 2);
          p.vx += Math.cos(a) * 0.05;
          p.vy += Math.sin(a) * 0.05;
        }

        p.x += p.vx;
        p.y += p.vy;

        // wrap
        if (p.x < -p.w) p.x = width + p.w;
        else if (p.x > width + p.w) p.x = -p.w;
        if (p.y < -p.h) p.y = height + p.h;
        else if (p.y > height + p.h) p.y = -p.h;

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.w, p.h);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 0, background: "#0a0a0f" }}
    />
  );
}
