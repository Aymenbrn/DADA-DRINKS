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
