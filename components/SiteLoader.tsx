"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Écran de chargement au démarrage (ou au rafraîchissement) du site :
 * fond noir, grand logo Dada au centre qui se remplit comme une canette de boisson.
 * Il attend les polices, la page et les scènes 3D principales, puis s'efface.
 * Il ne réapparaît pas lors de la navigation interne.
 */
const MAX_WAIT_MS = 9000; // au-delà, on montre le site quoi qu'il arrive
const MIN_SHOW_MS = 1100; // le temps de voir le remplissage

export default function SiteLoader() {
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const fill = fillRef.current;
    if (!root || !fill) return;
    document.documentElement.classList.add("is-loading");

    const t0 = performance.now();
    let fontsOk = false;
    let pageOk = document.readyState === "complete";
    let shown = 0; // niveau affiché (0 → 1)
    let finishing = false;
    let raf = 0;

    document.fonts?.ready.then(() => { fontsOk = true; }).catch(() => { fontsOk = true; });
    const onLoad = () => { pageOk = true; };
    window.addEventListener("load", onLoad, { once: true });

    const sceneOk = () => {
      const scenes = [...document.querySelectorAll<HTMLCanvasElement>(".ribbon-canvas, .launch-canvas")];
      return scenes.every((c) => c.classList.contains("is-ready"));
    };

    const finish = () => {
      if (finishing) return;
      finishing = true;
      root.classList.add("is-done");
      document.documentElement.classList.remove("is-loading");
      window.setTimeout(() => setGone(true), 750);
    };

    const tick = (now: number) => {
      const t = now - t0;
      const scenes = sceneOk();
      const steps = (fontsOk ? 1 : 0) + (pageOk ? 1 : 0) + (scenes ? 1 : 0);
      const allOk = steps === 3 || t > MAX_WAIT_MS;
      // Objectif : progresse avec les étapes, avance doucement en attendant, plafonne avant la fin
      const creep = Math.min(0.25, t / 16000);
      const target = allOk && t > MIN_SHOW_MS ? 1 : Math.min(0.92, 0.12 + steps * 0.24 + creep);
      shown += (target - shown) * (target === 1 ? 0.12 : 0.05);
      if (target === 1 && 1 - shown < 0.004) shown = 1;

      const h = fill.clientHeight;
      fill.style.setProperty("--lvl", `${(shown * (h + 18) - 18).toFixed(1)}px`);
      fill.style.setProperty("--wx", `${(t * 0.09) % 120}px`);
      fill.style.setProperty("--wx2", `${(-t * 0.06) % 120}px`);
      if (pctRef.current) pctRef.current.textContent = `${Math.round(shown * 100)}`;

      if (shown >= 1) {
        window.setTimeout(finish, 220);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      document.documentElement.classList.remove("is-loading");
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={rootRef} className="site-loader" role="status" aria-live="polite" aria-label="Chargement du site Dada Drinks">
      <div className="site-loader-glow" aria-hidden="true" />
      {/* Silhouette de canette derrière le logo */}
      <svg className="site-loader-can" viewBox="0 0 200 400" aria-hidden="true">
        <defs>
          <linearGradient id="ldCanBody" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0.02" />
            <stop offset="0.18" stopColor="#fff" stopOpacity="0.10" />
            <stop offset="0.32" stopColor="#fff" stopOpacity="0.03" />
            <stop offset="0.78" stopColor="#fff" stopOpacity="0.02" />
            <stop offset="0.9" stopColor="#fff" stopOpacity="0.07" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Corps : épaule et pied resserrés comme une canette slim */}
        <path
          d="M52 30 Q52 22 60 21 L140 21 Q148 22 148 30 L148 34 Q166 44 166 66 L166 340 Q166 360 150 368 L148 372 Q146 380 138 380 L62 380 Q54 380 52 372 L50 368 Q34 360 34 340 L34 66 Q34 44 52 34 Z"
          fill="url(#ldCanBody)" stroke="rgba(255,255,255,0.34)" strokeWidth="1.8" strokeLinejoin="round"
        />
        {/* Couvercle et anneau d'ouverture */}
        <ellipse cx="100" cy="22" rx="48" ry="5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" />
        <path d="M86 18 Q100 10 114 18" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeLinecap="round" />
        {/* Lignes d'épaule et de pied */}
        <path d="M34 66 Q100 76 166 66" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
        <path d="M34 340 Q100 350 166 340" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
      </svg>
      <div className="site-loader-logo" aria-hidden="true">
        {/* Logo « vide » : la canette avant le remplissage */}
        <img className="site-loader-empty" src="/brand/dada-logo.webp" alt="" width={750} height={303} />
        {/* Boisson : le vrai logo, révélé de bas en haut sous une surface en vague */}
        <div ref={fillRef} className="site-loader-fill">
          <img src="/brand/dada-logo.webp" alt="" width={750} height={303} />
          <span className="site-loader-inlogo">
          <span className="site-loader-sheen" />
          <span className="site-loader-bubbles">
            {Array.from({ length: 14 }, (_, i) => (
              <i key={i} style={{ left: `${(i * 53) % 96 + 2}%`, animationDelay: `${(i * 0.37) % 2.4}s`, animationDuration: `${1.6 + (i % 5) * 0.35}s`, width: 4 + (i % 4) * 2, height: 4 + (i % 4) * 2 }} />
            ))}
          </span>
          </span>
        </div>
      </div>
      <p className="site-loader-text">
        Ça se remplit… <span ref={pctRef}>0</span>&nbsp;%
      </p>
    </div>
  );
}
