"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CAT_LABELS, FLAVORS as ALL_FLAVORS, pad } from "@/lib/flavors";
import { createCarousel } from "@/lib/can3d/carousel";
import BeachDecor from "@/components/BeachDecor";
import { useAudience } from "@/components/AudienceContext";
import AudienceSwitch from "@/components/AudienceSwitch";

/** La nouveauté mise en avant à chaque ouverture / actualisation de la page */
const NEW_RELEASE = "cola-cherry";
/** Gamme de l'accueil : toutes les canettes, Cerise comprise */
const FLAVORS = ALL_FLAVORS;

/**
 * Accueil : toutes les canettes Dada en ruban 3D. La nouveauté (Cola Cherry) est au centre,
 * avec l'univers de sa saveur derrière elle ; deux flèches font défiler la gamme.
 */
export default function HomeCarousel() {
  const start = Math.max(0, FLAVORS.findIndex((f) => f.slug === NEW_RELEASE));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<ReturnType<typeof createCarousel> | null>(null);
  const [index, setIndex] = useState(start);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [bg, setBg] = useState<{ key: number; c: string; hi: string }[]>([{ key: 0, c: FLAVORS[start].c, hi: FLAVORS[start].hi }]);
  const f = FLAVORS[index];
  const audience = useAudience()?.side ?? "particulier";
  // l'interrupteur Particulier / Pro est affiché en haut à droite, à côté du panier (emplacement prévu dans l'en-tête)
  const [audSlot, setAudSlot] = useState<HTMLElement | null>(null);
  useEffect(() => setAudSlot(document.getElementById("header-aud-slot")), []);

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
    setBg((layers) => [...layers.slice(-1), { key: (layers.at(-1)?.key ?? 0) + 1, c: f.c, hi: f.hi }]);
  }, [f.c, f.hi]);

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

  // Barre des saveurs : on fait glisser le point, la canette suit (avec ses transitions)
  const railRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const lastPick = useRef(index);
  const pickAt = (clientX: number) => {
    const r = railRef.current?.getBoundingClientRect();
    if (!r || !r.width) return;
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    setDrag(ratio * 100);
    const i = Math.round(ratio * (FLAVORS.length - 1));
    if (i !== lastPick.current) {
      lastPick.current = i;
      apiRef.current?.goTo(i);
    }
  };
  useEffect(() => {
    if (drag === null) lastPick.current = index;
  }, [index, drag]);

  const isNew = f.slug === NEW_RELEASE;
  const pct = drag ?? (FLAVORS.length > 1 ? (index / (FLAVORS.length - 1)) * 100 : 0);
  const rail = `linear-gradient(90deg, ${FLAVORS.map((x, i) => `${x.hi} ${((i / (FLAVORS.length - 1)) * 100).toFixed(1)}%`).join(", ")})`;

  return (
    <section className="ribbon" aria-roledescription="carrousel" aria-label="La gamme Dada en 3D" style={{ "--u-hi": f.hi, "--u-can": f.can ?? f.c } as CSSProperties}>
      {bg.map((l) => (
        <div key={l.key} className="ribbon-bg" style={{ "--u": l.c, "--uh": l.hi } as CSSProperties} aria-hidden="true" />
      ))}
      <div className="ribbon-light" aria-hidden="true" />
      <BeachDecor />

      <canvas
        ref={canvasRef}
        className={`ribbon-canvas${ready ? " is-ready" : ""}`}
        role="img"
        aria-label={`Les canettes Dada en 3D ; au centre, Dada ${f.name}`}
      />
      <div className="ribbon-vignette" aria-hidden="true" />
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

      {/* Le goût, en grand, sous la canette */}
      {audSlot && createPortal(<AudienceSwitch className="header-switch" />, audSlot)}
      <div className="ribbon-center" aria-live="polite">
        {isNew ? (
          <p className="ribbon-new">
            <span className="ribbon-new-tag">NOUVEAUTÉ</span>
            <span className="ribbon-new-sub">La nouvelle saveur Dada</span>
          </p>
        ) : null}
        <h1 className="ribbon-name" key={f.slug}>
          <span className="sr-only">Dada </span>
          {f.name}
        </h1>
        <div
          ref={railRef}
          className={`ribbon-slider${drag !== null ? " is-drag" : ""}`}
          style={{ "--rail": rail, "--pct": `${pct}%` } as CSSProperties}
          role="slider"
          tabIndex={0}
          aria-label="Choisir une saveur"
          aria-valuemin={1}
          aria-valuemax={FLAVORS.length}
          aria-valuenow={index + 1}
          aria-valuetext={`Dada ${f.name}`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            lastPick.current = index;
            pickAt(e.clientX);
          }}
          onPointerMove={(e) => {
            if (drag !== null) pickAt(e.clientX);
          }}
          onPointerUp={() => setDrag(null)}
          onPointerCancel={() => setDrag(null)}
        >
          <div className="ribbon-rail" aria-hidden="true" />
          <span className="ribbon-knob" aria-hidden="true" />
        </div>
        <p className="ribbon-hint">Glisser ou utiliser les flèches pour découvrir</p>
          <div className="ribbon-actions">
            {/* mobile : l'interrupteur reste en bas, avec le bouton d'action */}
            <AudienceSwitch className="ribbon-switch is-mobile-only" />
            {audience === "pro" ? (
              <a href="#offre-pro" className="btn ribbon-buy">Équiper mon commerce</a>
            ) : (
              <Link href="/#saveurs" className="btn ribbon-buy">Remplir le frigo</Link>
            )}
          </div>

      </div>
    </section>
  );
}

/** Chevron dessiné en points, comme sur la référence */
function DottedChevron({ dir }: { dir: 1 | -1 }) {
  // Forme du « D » du logo Dada, entièrement en verre liquide, flèche blanche au centre.
  // Flèche précédente : D en miroir.
  const D = "M13 8 H35 A28 28 0 0 1 35 64 H13 Z";
  const eye = "M26 21.5 H35 A14.5 14.5 0 0 1 35 50.5 H26 Z";
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true" className="dada-arrow">
      <g transform={dir === -1 ? "translate(72 0) scale(-1 1)" : undefined}>
        <g transform="skewX(-6) translate(4 0)">
          {/* D entièrement en verre liquide : teinte légère, reflets et liserés lumineux (le flou est fait en CSS) */}
          <path d={D} fill="rgba(255,255,255,0.14)" />
          <path d={D} fill="url(#dadaGloss)" />
          <path d={D} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.3" strokeLinejoin="round" transform="translate(0 0)" className="dada-glass-rim" />
          <path d={eye} fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinejoin="round" />
        </g>
      </g>
      <defs>
        <linearGradient id="dadaGloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.10" />
        </linearGradient>
      </defs>
      <path d={dir === 1 ? "M36 29l6 7-6 7" : "M38 29l-6 7 6 7"} fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
