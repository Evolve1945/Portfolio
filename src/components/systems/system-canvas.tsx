"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

// Live, mouse-reactive node graph drawn on <canvas> — the animated "systems"
// banner. Colours read from CSS variables so it tracks the theme. When the user
// prefers reduced motion, it renders a single static frame (no loop).
export function SystemCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      return {
        accent: s.getPropertyValue("--accent").trim() || "#2f43e6",
        node: s.getPropertyValue("--faint").trim() || "#999999",
        line: s.getPropertyValue("--border").trim() || "#cccccc",
      };
    };
    let colors = readColors();
    const themeObs = new MutationObserver(() => (colors = readColors()));
    themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const N = 30;
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0007,
      vy: (Math.random() - 0.5) * 0.0007,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const maxD = Math.min(w, h) * 0.55;

      for (let i = 0; i < N; i++) {
        const ax = nodes[i].x * w;
        const ay = nodes[i].y * h;
        for (let j = i + 1; j < N; j++) {
          const bx = nodes[j].x * w;
          const by = nodes[j].y * h;
          const d = Math.hypot(ax - bx, ay - by);
          if (d < maxD) {
            ctx.globalAlpha = (1 - d / maxD) * 0.5;
            ctx.strokeStyle = colors.line;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < N; i++) {
        const ax = nodes[i].x * w;
        const ay = nodes[i].y * h;
        const dm = Math.hypot(ax - mouse.x, ay - mouse.y);
        const near = dm < 100;
        ctx.globalAlpha = 1;
        ctx.fillStyle = near ? colors.accent : colors.node;
        ctx.beginPath();
        ctx.arc(ax, ay, near ? 3.5 : 2, 0, Math.PI * 2);
        ctx.fill();
        if (near) {
          ctx.globalAlpha = (1 - dm / 100) * 0.7;
          ctx.strokeStyle = colors.accent;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    if (reduce) draw();
    else raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObs.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
