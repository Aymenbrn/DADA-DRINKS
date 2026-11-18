"use client";

import { useEffect, useRef } from "react";

/** Ciel bleu de jour avec quelques nuages cotonneux qui dérivent lentement (chapitre 1 de l'histoire). */
type Cloud = { x: number; y: number; s: number; v: number; puffs: { dx: number; dy: number; r: number }[] };

export default function SkyClouds({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const g = cv?.getContext("2d");
    if (!cv || !g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seed = 5;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let W = 0, H = 0, dpr = 1;
    let clouds: Cloud[] = [];

    const build = () => {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      cv.width = W * dpr; cv.height = H * dpr;
      seed = 5;
      const n = Math.max(4, Math.round(W / 260));
      clouds = Array.from({ length: n }, (_, i) => {
        const s = 0.6 + rnd() * 0.9;
        const puffs = Array.from({ length: 7 + Math.floor(rnd() * 5) }, (_, k) => ({
          dx: (k - 4) * 34 + (rnd() - 0.5) * 24,
          dy: -Math.sin((k / 9) * Math.PI) * 30 + (rnd() - 0.5) * 12,
          r: 34 + rnd() * 30,
        }));
        return { x: (i / n) * W + rnd() * 160, y: H * (0.08 + rnd() * 0.42), s, v: 4 + rnd() * 6, puffs };
      });
    };

    const drawCloud = (c: Cloud, x: number) => {
      g.save();
      g.translate(x, c.y);
      g.scale(c.s, c.s);
      // ombre douce sous le nuage
      for (const p of c.puffs) {
        const gr = g.createRadialGradient(p.dx, p.dy + 14, 0, p.dx, p.dy + 14, p.r * 1.2);
        gr.addColorStop(0, "rgba(120,150,190,0.35)"); gr.addColorStop(1, "rgba(120,150,190,0)");
        g.fillStyle = gr; g.beginPath(); g.arc(p.dx, p.dy + 14, p.r * 1.2, 0, 6.283); g.fill();
      }
      // corps lumineux du nuage
      for (const p of c.puffs) {
        const gr = g.createRadialGradient(p.dx - p.r * 0.3, p.dy - p.r * 0.35, 0, p.dx, p.dy, p.r);
        gr.addColorStop(0, "rgba(255,255,255,0.98)"); gr.addColorStop(0.7, "rgba(246,250,255,0.9)"); gr.addColorStop(1, "rgba(235,243,252,0)");
        g.fillStyle = gr; g.beginPath(); g.arc(p.dx, p.dy, p.r, 0, 6.283); g.fill();
      }
      g.restore();
    };

    let raf = 0, visible = true;
    const t0 = performance.now();
    const draw = (now: number) => {
      const t = reduce ? 0 : (now - t0) / 1000;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      const span = W + 520;
      for (const c of clouds) drawCloud(c, ((c.x + t * c.v + 260) % span + span) % span - 260);
    };
    const loop = (now: number) => { if (visible) draw(now); raf = requestAnimationFrame(loop); };
    build();
    draw(performance.now());
    if (!reduce) raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => { build(); draw(performance.now()); });
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);

  return <canvas ref={ref} className={`sky-clouds${className ? ` ${className}` : ""}`} aria-hidden="true" />;
}
