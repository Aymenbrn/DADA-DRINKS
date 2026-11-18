"use client";

import { useEffect, useRef } from "react";

/**
 * Ciel bleu avec des nuages réalistes (cumulus) qui dérivent lentement.
 * Chaque nuage est « peint » une fois à partir d'un bruit fractal (texture cotonneuse, bords effilochés),
 * éclairé par le haut (sommet blanc lumineux, base gris-bleu), puis déplacé en parallaxe sur deux plans.
 */
type Cloud = { img: HTMLCanvasElement; x: number; y: number; w: number; h: number; v: number; a: number };

// Bruit de valeur 2D + fBm
function makeNoise(seed: number) {
  const P = new Uint8Array(512);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < 512; i++) P[i] = perm[i & 255];
  const val = new Float32Array(256).map(() => rnd());
  const fade = (t: number) => t * t * (3 - 2 * t);
  const n2 = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = val[P[(xi & 255) + P[yi & 255]]], b = val[P[((xi + 1) & 255) + P[yi & 255]]];
    const c = val[P[(xi & 255) + P[(yi + 1) & 255]]], d = val[P[((xi + 1) & 255) + P[(yi + 1) & 255]]];
    const u = fade(xf), v = fade(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  return (x: number, y: number) => {
    let f = 0, amp = 0.5, fr = 1;
    for (let o = 0; o < 6; o++) { f += amp * n2(x * fr, y * fr); fr *= 2.03; amp *= 0.5; }
    return f;
  };
}

function paintCloud(seed: number, W: number, H: number) {
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const img = g.createImageData(W, H);
  const fbm = makeNoise(seed);
  const fbm2 = makeNoise(seed + 71);
  // forme : plusieurs bosses (cumulus) posées sur une base plate
  let s = seed * 13 + 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const nb = 6 + Math.floor(rnd() * 4);
  // bosses en pixels : plus grosses au centre (tour de cumulus), base commune plate
  const bumps = Array.from({ length: nb }, (_, i) => {
    const t = i / (nb - 1), mid = Math.sin(t * Math.PI);
    const r = Math.min(W * (0.07 + mid * 0.08 + rnd() * 0.03), H * 0.36);
    const x = Math.max(r + W * 0.08, Math.min(W - r - W * 0.08, W * (0.22 + t * 0.56 + (rnd() - 0.5) * 0.04)));
    return { x, y: Math.max(r + H * 0.1, H * 0.72 - r * (0.5 + rnd() * 0.3)), r };
  });
  const baseY = H * 0.8;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W, v = y / H;
      // déformation du domaine : contours cotonneux et irréguliers
      const wx = x + (fbm2(u * 4, v * 4) - 0.5) * W * 0.08, wy = y + (fbm2(u * 4 + 9, v * 4 + 3) - 0.5) * H * 0.18;
      let d = 0;
      for (const bp of bumps) {
        const dx = (wx - bp.x) / bp.r, dy = (wy - bp.y) / bp.r;
        d = Math.max(d, 1 - Math.sqrt(dx * dx + dy * dy));
      }
      const flat = Math.max(0, Math.min(1, (baseY - wy) / (H * 0.08) + 0.5));
      const n = fbm(u * 7, v * 5);
      // le relief du bruit ne joue que près du corps du nuage : pas de lambeaux isolés
      const near = Math.max(0, Math.min(1, (d + 0.08) / 0.2));
      let dens = (Math.max(0, d) * 1.6 + (n - 0.5) * 1.0 * near * (1 - d * 0.4)) * flat;
      // bord du dessin : aucun nuage ne touche le cadre (jamais coupé)
      const edge = Math.min(u, 1 - u, v * 1.4, 1 - v);
      const em = Math.max(0, Math.min(1, (edge - 0.015) / 0.06));
      const a = Math.max(0, Math.min(1, (dens - 0.14) / 0.16)) * em;
      if (a <= 0) continue;
      // éclairage : soleil en haut à gauche ; base et creux gris-bleu
      const n2v = fbm2(u * 12 + 3, v * 9);
      const top = 1 - Math.max(0, Math.min(1, (wy - (baseY - H * 0.62)) / (H * 0.62)));
      const light = Math.max(0, Math.min(1, 0.25 + top * 0.75 + (0.5 - u) * 0.12 + (n2v - 0.5) * 0.45 + Math.min(d, 0.4) * 0.3));
      const R = 140 + light * 115, G = 156 + light * 99, B = 186 + light * 69;
      const i = (y * W + x) * 4;
      img.data[i] = R; img.data[i + 1] = G; img.data[i + 2] = B; img.data[i + 3] = a * 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c;
}

export default function SkyClouds({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const g = cv?.getContext("2d");
    if (!cv || !g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, dpr = 1;
    let clouds: Cloud[] = [];
    // Nuages peints une seule fois (taille fixe, réutilisés)
    const sprites = [11, 23, 37, 41, 53, 67].map((sd, k) => paintCloud(sd, k % 2 ? 420 : 360, k % 2 ? 260 : 235));

    const build = () => {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      cv.width = W * dpr; cv.height = H * dpr;
      let s = 5;
      const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const n = Math.max(4, Math.round(W / 300));
      clouds = Array.from({ length: n }, (_, i) => {
        const far = i % 3 === 0; // plan lointain : plus petit, plus pâle, plus lent
        const sc = (far ? 0.8 : 1.25 + rnd() * 0.7) * Math.min(1.4, Math.max(0.75, W / 1100));
        const img = sprites[i % sprites.length];
        return { img, w: img.width * sc, h: img.height * sc, x: (i / n) * (W + 400) - 200 + rnd() * 120, y: H * (far ? 0.12 + rnd() * 0.15 : 0.08 + rnd() * 0.5), v: far ? 3 : 6 + rnd() * 5, a: far ? 0.7 : 0.95 };
      });
      // jamais coupés par le bas ou le haut de la zone : chaque nuage tient en entier en hauteur
      clouds.forEach((c) => { c.y = Math.max(-c.h * 0.08, Math.min(c.y, H - c.h * 0.92)); });
      clouds.sort((a, b) => a.v - b.v); // les lointains derrière
    };

    let raf = 0, visible = true;
    const t0 = performance.now();
    const draw = (now: number) => {
      const t = reduce ? 0 : (now - t0) / 1000;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      for (const c of clouds) {
        const span = W + c.w + 200;
        const x = ((c.x + t * c.v) % span + span) % span - c.w - 100;
        g.globalAlpha = c.a;
        g.drawImage(c.img, x, c.y, c.w, c.h);
      }
      g.globalAlpha = 1;
    };
    let last = 0;
    // 30 images/s suffisent pour des nuages qui dérivent lentement ; rien n'est calculé hors écran
    const loop = (now: number) => { if (visible && now - last > 33) { last = now; draw(now); } raf = requestAnimationFrame(loop); };
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
