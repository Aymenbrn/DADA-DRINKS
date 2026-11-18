"use client";

import { useEffect, useRef } from "react";

/**
 * Ciel de nuit détaillé (même ambiance que le chapitre 1 de l'histoire) :
 * dégradé bleu nuit, voie lactée, milliers d'étoiles de tailles et de teintes variées
 * qui scintillent, quelques étoiles brillantes à aigrettes et des étoiles filantes.
 */
type Star = { x: number; y: number; r: number; a: number; tw: number; ph: number; c: string };

export default function StarSky({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    if (!g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seed = 42;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let W = 0, H = 0, dpr = 1;
    let stars: Star[] = [];
    let bright: Star[] = [];
    let milky: HTMLCanvasElement | null = null;
    const tints = ["#ffffff", "#fff4e0", "#dbe8ff", "#cfe0ff", "#ffe9c7", "#f0f4ff"];

    const build = () => {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      cv.width = W * dpr; cv.height = H * dpr;
      seed = 42;
      const n = Math.round((W * H) / 900);
      // la voie lactée : bande diagonale où les étoiles sont plus denses
      const band = (x: number, y: number) => {
        const d = (y - (H * 0.95 - x * 0.55)) / (H * 0.22);
        return Math.exp(-d * d);
      };
      stars = [];
      for (let i = 0; i < n * 1.6 && stars.length < n; i++) {
        const x = rnd() * W, y = rnd() * H;
        if (rnd() > 0.35 + band(x, y) * 0.65) continue;
        const big = rnd();
        stars.push({ x, y, r: big > 0.985 ? 1.3 + rnd() * 0.8 : big > 0.9 ? 0.8 + rnd() * 0.5 : 0.3 + rnd() * 0.45, a: 0.35 + rnd() * 0.65, tw: 0.6 + rnd() * 2.2, ph: rnd() * 6.283, c: tints[Math.floor(rnd() * tints.length)] });
      }
      bright = Array.from({ length: Math.max(6, Math.round((W * H) / 70000)) }, () => ({ x: rnd() * W, y: rnd() * H * 0.85, r: 1.6 + rnd() * 1.4, a: 1, tw: 0.4 + rnd(), ph: rnd() * 6.283, c: tints[Math.floor(rnd() * 3)] }));
      // voie lactée pré-rendue (nébuleuse douce + poussière)
      milky = document.createElement("canvas");
      milky.width = W; milky.height = H;
      const m = milky.getContext("2d")!;
      for (let i = 0; i < 26; i++) {
        const t = i / 25, x = t * W, y = H * 0.95 - x * 0.55 + (rnd() - 0.5) * H * 0.12;
        const rr = H * (0.16 + rnd() * 0.14);
        const gr = m.createRadialGradient(x, y, 0, x, y, rr);
        const hue = rnd() > 0.5 ? "120,150,255" : rnd() > 0.5 ? "190,140,255" : "255,200,170";
        gr.addColorStop(0, `rgba(${hue},${0.07 + rnd() * 0.06})`); gr.addColorStop(1, `rgba(${hue},0)`);
        m.fillStyle = gr; m.fillRect(x - rr, y - rr, rr * 2, rr * 2);
      }
      for (let i = 0; i < (W * H) / 120; i++) {
        const x = rnd() * W, y = H * 0.95 - x * 0.55 + (rnd() + rnd() + rnd() - 1.5) * H * 0.18;
        m.fillStyle = `rgba(255,255,255,${0.05 + rnd() * 0.18})`; m.fillRect(x, y, 0.8, 0.8);
      }
      // nuages sombres dans la bande (poussière interstellaire)
      for (let i = 0; i < 10; i++) {
        const x = rnd() * W, y = H * 0.95 - x * 0.55 + (rnd() - 0.5) * H * 0.06, rr = H * (0.04 + rnd() * 0.06);
        const gr = m.createRadialGradient(x, y, 0, x, y, rr);
        gr.addColorStop(0, "rgba(8,12,28,0.35)"); gr.addColorStop(1, "rgba(8,12,28,0)");
        m.fillStyle = gr; m.fillRect(x - rr, y - rr, rr * 2, rr * 2);
      }
    };

    let shoot: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextShoot = 2.5;
    let raf = 0, visible = true;
    const t0 = performance.now();

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      if (milky) g.drawImage(milky, 0, 0, W, H);
      for (const s of stars) {
        const k = reduce ? 1 : 0.65 + 0.35 * Math.sin(t * s.tw + s.ph);
        g.globalAlpha = s.a * k;
        g.fillStyle = s.c;
        g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.283); g.fill();
      }
      // étoiles brillantes : halo + aigrettes
      for (const s of bright) {
        const k = reduce ? 1 : 0.7 + 0.3 * Math.sin(t * s.tw + s.ph);
        g.globalAlpha = 0.9 * k;
        const gr = g.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
        gr.addColorStop(0, s.c); gr.addColorStop(0.15, "rgba(200,220,255,0.35)"); gr.addColorStop(1, "rgba(200,220,255,0)");
        g.fillStyle = gr; g.beginPath(); g.arc(s.x, s.y, s.r * 6, 0, 6.283); g.fill();
        g.strokeStyle = "rgba(230,240,255,0.55)"; g.lineWidth = 0.7;
        const L = s.r * (7 + 3 * k);
        g.beginPath(); g.moveTo(s.x - L, s.y); g.lineTo(s.x + L, s.y); g.moveTo(s.x, s.y - L); g.lineTo(s.x, s.y + L); g.stroke();
        g.fillStyle = "#fff"; g.beginPath(); g.arc(s.x, s.y, s.r * 0.7, 0, 6.283); g.fill();
      }
      // étoile filante de temps en temps
      if (!reduce) {
        if (!shoot && t > nextShoot) {
          shoot = { x: W * (0.2 + Math.random() * 0.7), y: H * Math.random() * 0.4, vx: -(260 + Math.random() * 200), vy: 120 + Math.random() * 90, life: 0 };
          nextShoot = t + 4 + Math.random() * 6;
        }
        if (shoot) {
          shoot.life += 1 / 60;
          shoot.x += shoot.vx / 60; shoot.y += shoot.vy / 60;
          const a = Math.max(0, 1 - shoot.life / 0.9);
          const gr = g.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * 0.25, shoot.y - shoot.vy * 0.25);
          gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, "rgba(255,255,255,0)");
          g.globalAlpha = 1; g.strokeStyle = gr; g.lineWidth = 1.6;
          g.beginPath(); g.moveTo(shoot.x, shoot.y); g.lineTo(shoot.x - shoot.vx * 0.25, shoot.y - shoot.vy * 0.25); g.stroke();
          if (shoot.life > 0.9) shoot = null;
        }
      }
      g.globalAlpha = 1;
    };

    const loop = (now: number) => {
      if (visible) draw(now);
      raf = requestAnimationFrame(loop);
    };
    build();
    draw(performance.now());
    if (!reduce) raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => { build(); draw(performance.now()); });
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);

  return <canvas ref={ref} className={`star-sky${className ? ` ${className}` : ""}`} aria-hidden="true" />;
}
