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

  return (
    <section className="ribbon" aria-roledescription="carrousel" aria-label="La gamme Dada en 3D" style={{ "--u-hi": f.hi } as CSSProperties}>
      {bg.map((l) => (
        <div key={l.key} className="ribbon-bg" style={{ "--u": l.c } as CSSProperties} aria-hidden="true" />
      ))}
      <div className="ribbon-progress" aria-hidden="true">
        <span style={{ width: `${((index + 1) / FLAVORS.length) * 100}%` }} />
      </div>

      <canvas
        ref={canvasRef}
        className={`ribbon-canvas${ready ? " is-ready" : ""}`}
        role="img"
        aria-label={`Les canettes Dada en 3D ; au centre, Dada ${f.name}`}
      />
      {failed && <p className="launch-fallback">La 3D n’est pas disponible sur cet appareil.</p>}

      <div className="ribbon-arrows">
        <button type="button" className="ribbon-arrow" aria-label="Canette précédente" onClick={() => apiRef.current?.prev()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <button type="button" className="ribbon-arrow" aria-label="Canette suivante" onClick={() => apiRef.current?.next()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      <div className="ribbon-copy" aria-live="polite">
        <p className="ribbon-eyebrow">
          {isNew ? <span className="ribbon-new">NOUVEAUTÉ</span> : null}
          {CAT_LABELS[f.cat].toUpperCase()} — N° {pad(index)} / {FLAVORS.length}
        </p>
        <h1 className="ribbon-title">
          Dada <em>{f.name}.</em>
        </h1>
        <p className="ribbon-lede">{isNew ? "La nouvelle sortie Dada : un cola aux notes de cerise intensément fruitées." : f.note}</p>
        <div className="ribbon-actions">
          <button type="button" className="btn ribbon-buy" onClick={() => add(f.slug)}>
            Ajouter au panier · {PACK_PRICE}
          </button>
          <Link href={flavorHref(f.slug)} className="btn btn-ghost">Découvrir</Link>
        </div>
      </div>

      <ul className="ribbon-dots" aria-label="Choisir une saveur">
        {FLAVORS.map((x, i) => (
          <li key={x.slug}>
            <button
              type="button"
              aria-label={`Dada ${x.name}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => apiRef.current?.goTo(i)}
              style={{ "--dot": x.hi } as CSSProperties}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
