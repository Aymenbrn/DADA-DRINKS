"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { CAT_LABELS, FLAVORS, PACK_PRICE, flavorHref, pad } from "@/lib/flavors";
import { createCarousel } from "@/lib/can3d/carousel";

/** La nouveauté mise en avant à l'ouverture de la page */
const NEW_RELEASE = "cola-cherry";

/**
 * Accueil : les 13 canettes Dada en ruban 3D. La nouveauté (Cola Cherry) est au centre,
 * avec l'univers de sa saveur derrière elle ; deux flèches font défiler la gamme.
 */
export default function HomeCarousel() {
  const start = Math.max(0, FLAVORS.findIndex((f) => f.slug === NEW_RELEASE));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<ReturnType<typeof createCarousel> | null>(null);
  const [index, setIndex] = useState(start);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [bg, setBg] = useState<{ key: number; c: string }[]>([{ key: 0, c: FLAVORS[start].c }]);
  const { add } = useCart();
  const f = FLAVORS[index];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      apiRef.current = createCarousel(canvas, {
        flavors: FLAVORS,
        start,
        onSelect: setIndex,
        onReady: () => setReady(true),
      });
      requestAnimationFrame(() => setReady(true));
    } catch {
      setFailed(true);
    }
    return () => apiRef.current?.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fond aux couleurs de la saveur : le nouveau fond se fond par-dessus l'ancien
  useEffect(() => {
    setBg((layers) => [...layers.slice(-1), { key: (layers.at(-1)?.key ?? 0) + 1, c: f.c }]);
  }, [f.c]);

  // Flèches du clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) return; // seulement quand la section est visible
      if (e.key === "ArrowRight") apiRef.current?.next();
      if (e.key === "ArrowLeft") apiRef.current?.prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isNew = f.slug === NEW_RELEASE;
  const pct = FLAVORS.length > 1 ? (index / (FLAVORS.length - 1)) * 100 : 0;
  const rail = `linear-gradient(90deg, ${FLAVORS.map((x, i) => `${x.hi} ${((i / (FLAVORS.length - 1)) * 100).toFixed(1)}%`).join(", ")})`;

  return (
    <section className="ribbon" aria-roledescription="carrousel" aria-label="La gamme Dada en 3D" style={{ "--u-hi": f.hi } as CSSProperties}>
      {bg.map((l) => (
        <div key={l.key} className="ribbon-bg" style={{ "--u": l.c } as CSSProperties} aria-hidden="true" />
      ))}
      <div className="ribbon-light" aria-hidden="true" />

      <canvas
        ref={canvasRef}
        className={`ribbon-canvas${ready ? " is-ready" : ""}`}
        role="img"
        aria-label={`Les canettes Dada en 3D ; au centre, Dada ${f.name}`}
      />
      {failed && <p className="launch-fallback">La 3D n’est pas disponible sur cet appareil.</p>}

      {/* Flèches en pointillés, juste à côté de la canette du centre */}
      <button type="button" className="ribbon-arrow is-prev" aria-label="Canette précédente" onClick={() => apiRef.current?.prev()}>
        <DottedChevron dir={-1} />
      </button>
      <button type="button" className="ribbon-arrow is-next" aria-label="Canette suivante" onClick={() => apiRef.current?.next()}>
        <DottedChevron dir={1} />
      </button>

      <div className="ribbon-meta">
        <p className="ribbon-eyebrow">
          {CAT_LABELS[f.cat].toUpperCase()} — N° {pad(index)} / {FLAVORS.length}
        </p>
        <p className="ribbon-lede">{isNew ? "La nouvelle sortie Dada : un cola aux notes de cerise intensément fruitées." : f.note}</p>
      </div>

      <div className="ribbon-actions">
        <button type="button" className="btn ribbon-buy" onClick={() => add(f.slug)}>
          Ajouter au panier · {PACK_PRICE}
        </button>
        <Link href={flavorHref(f.slug)} className="btn btn-ghost ribbon-more">Voir la fiche</Link>
      </div>

      {/* Le goût, en grand, sous la canette */}
      <div className="ribbon-center" aria-live="polite">
        {isNew ? <span className="ribbon-new">NOUVEAUTÉ</span> : null}
        <h1 className="ribbon-name" key={f.slug}>
          <span className="sr-only">Dada </span>
          {f.name}
        </h1>
        <div className="ribbon-slider" style={{ "--rail": rail, "--pct": `${pct}%` } as CSSProperties}>
          <div className="ribbon-rail" aria-hidden="true" />
          <span className="ribbon-knob" aria-hidden="true" />
          <ul aria-label="Choisir une saveur">
            {FLAVORS.map((x, i) => (
              <li key={x.slug}>
                <button
                  type="button"
                  aria-label={`Dada ${x.name}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => apiRef.current?.goTo(i)}
                />
              </li>
            ))}
          </ul>
        </div>
        <p className="ribbon-hint">Glisser ou cliquer pour découvrir</p>
      </div>
    </section>
  );
}

/** Chevron dessiné en points, comme sur la référence */
function DottedChevron({ dir }: { dir: 1 | -1 }) {
  const pts: [number, number][] = [];
  for (let k = 0; k < 5; k++) {
    const x = dir === 1 ? 8 + k * 4 : 32 - k * 4;
    pts.push([x, 4 + k * 4]);
    if (k < 4) pts.push([x, 36 - k * 4]);
  }
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 2.3 : 1.7} fill="currentColor" />
      ))}
    </svg>
  );
}
