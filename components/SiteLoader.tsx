"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FLAVORS, flavorHref } from "@/lib/flavors";

/**
 * Écran de chargement au démarrage (ou au rafraîchissement) du site :
 * fond noir, grand logo Dada au centre qui se remplit comme une canette de boisson.
 *
 * Il sert surtout à préparer le site pendant qu'il s'affiche :
 *  - les étiquettes 3D des 13 canettes (téléchargées et décodées une fois pour toutes),
 *  - la scène 3D de la page ouverte (canettes de l'accueil ou fiche produit),
 *  - les polices,
 *  - puis, en tâche de fond, les pages principales et les modules 3D pro, pour une navigation instantanée.
 * Le niveau de remplissage suit l'avancement réel de ces tâches.
 * Il ne réapparaît pas lors de la navigation interne.
 */
const MAX_WAIT_MS = 9000; // au-delà, on montre le site quoi qu'il arrive
const MIN_SHOW_MS = 900; // le temps de voir le remplissage

/** Pages préchargées pendant le chargement (navigation instantanée ensuite) */
const ROUTES = ["/boutique", "/professionnels", "/notre-histoire", "/collaborations", "/actualites", "/panier"];

export default function SiteLoader() {
  const router = useRouter();
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
    let alive = true;

    // ——— Tâches suivies (avec leur poids dans la jauge) ———
    let fontsOk = false;
    let pageOk = document.readyState === "complete";
    let labelsDone = 0;
    const labelsTotal = FLAVORS.length;

    document.fonts?.ready.then(() => { fontsOk = true; }).catch(() => { fontsOk = true; });
    const onLoad = () => { pageOk = true; };
    window.addEventListener("load", onLoad, { once: true });

    // Étiquettes 3D de toute la gamme : téléchargées et préparées maintenant, réutilisées par toutes les scènes
    // Mobile : les étiquettes ne sont chargées que par les scènes qui en ont besoin (économie de mémoire)
    const smallScreen = window.innerWidth < 900;
    if (smallScreen) labelsDone = labelsTotal;
    else import("@/lib/can3d/labels")
      .then(({ getLabelImage }) => {
        for (const f of FLAVORS) {
          getLabelImage(f).catch(() => undefined).finally(() => { labelsDone += 1; });
        }
      })
      .catch(() => { labelsDone = labelsTotal; });

    const sceneOk = () => {
      const scenes = [...document.querySelectorAll<HTMLCanvasElement>(".ribbon-canvas, .launch-canvas, .sx-canvas")];
      return scenes.every((c) => c.classList.contains("is-ready"));
    };

    // Préchargement de fond, sans retarder l'ouverture : pages principales, fiches produits, modules 3D pro
    // Sur mobile ou connexion lente : on ne précharge que l'essentiel (moins de données, moins de mémoire)
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const light = window.innerWidth < 900 || !!conn?.saveData || /2g|3g/.test(conn?.effectiveType ?? "");
    const warm = window.setTimeout(() => {
      ROUTES.forEach((r) => router.prefetch(r));
      if (light) return;
      FLAVORS.forEach((f) => router.prefetch(flavorHref(f.slug)));
      import("@/lib/can3d/showcase").catch(() => undefined);
      import("@/lib/can3d/pallet").catch(() => undefined);
      import("@/lib/can3d/fridge").catch(() => undefined);
    }, 1200);

    const progress = () =>
      (fontsOk ? 0.1 : 0) +
      (pageOk ? 0.15 : 0) +
      0.45 * (labelsDone / labelsTotal) +
      (sceneOk() ? 0.3 : 0);

    let shown = 0; // niveau affiché (0 → 1)
    let finishing = false;
    let raf = 0;

    const finish = () => {
      if (finishing || !alive) return;
      finishing = true;
      root.classList.add("is-done");
      document.documentElement.classList.remove("is-loading");
      window.setTimeout(() => alive && setGone(true), 750);
    };

    const tick = (now: number) => {
      const t = now - t0;
      const real = progress();
      const allOk = real >= 0.999 || t > MAX_WAIT_MS;
      // La jauge suit l'avancement réel ; elle ne déborde jamais au-delà de ce qui est vraiment chargé
      const target = allOk && t > MIN_SHOW_MS ? 1 : Math.min(0.96, Math.max(0.06, real));
      shown += (target - shown) * (target === 1 ? 0.14 : 0.08);
      if (target === 1 && 1 - shown < 0.004) shown = 1;

      const h = fill.clientHeight;
      fill.style.setProperty("--lvl", `${(shown * (h + 18) - 18).toFixed(1)}px`);
      fill.style.setProperty("--wx", `${(t * 0.09) % 120}px`);
      fill.style.setProperty("--wx2", `${(-t * 0.06) % 120}px`);
      if (pctRef.current) pctRef.current.textContent = `${Math.round(shown * 100)}`;

      if (shown >= 1) {
        window.setTimeout(finish, 200);
        return;
      }
      schedule();
    };
    // Minuteur plutôt que requestAnimationFrame : le chargement avance même si l'affichage est suspendu
    const schedule = () => {
      raf = window.setTimeout(() => tick(performance.now()), 16) as unknown as number;
    };
    schedule();
    // Filet de sécurité : le site s'affiche quoi qu'il arrive
    const safety = window.setTimeout(finish, MAX_WAIT_MS + 1500);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(raf);
      window.clearTimeout(safety);
      window.clearTimeout(warm);
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
