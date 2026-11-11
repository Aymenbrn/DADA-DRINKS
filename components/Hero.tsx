"use client";

import Link from "next/link";
import { useState } from "react";
import Can from "./Can";
import { FLAVORS, flavorHref, pad } from "@/lib/flavors";

export default function Hero() {
  const [idx, setIdx] = useState(0);
  const f = FLAVORS[idx];
  const prev = () => setIdx((i) => (i + FLAVORS.length - 1) % FLAVORS.length);
  const next = () => setIdx((i) => (i + 1) % FLAVORS.length);

  return (
    <section
      id="top"
      className="hero"
      style={{ background: `radial-gradient(55% 65% at 72% 48%, ${f.c}59 0%, rgba(10,10,10,0) 70%), #0A0A0A` }}
    >
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="eyebrow" style={{ color: "var(--muted-on-dark)" }}>SOFT DRINKS — NÉS À NANTERRE — ESPRIT DADA</p>
          <h1 className="h-xl" style={{ fontSize: "clamp(56px, 7.4vw, 112px)", lineHeight: 0.9 }}>
            Casse les codes.
            <span className="serif-i" style={{ display: "block", color: f.hi, transition: "color .6s" }}>Pas la canette.</span>
          </h1>
          <p style={{ margin: 0, maxWidth: 480, fontSize: 19, lineHeight: 1.5, color: "var(--muted-on-dark)" }}>
            Treize saveurs pétillantes inspirées du dadaïsme : audacieuses, fruitées, un brin insolentes. Faites pour bousculer vos journées.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <Link href={flavorHref(f.slug)} className="btn btn-accent">Commander Dada {f.name} — 32 €</Link>
            <a href="#saveurs" className="btn btn-ghost">Voir les 13 saveurs →</a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <p className="eyebrow" style={{ fontSize: 12, color: "var(--muted-on-dark)" }}>
              CHOISIS TA SAVEUR — <span style={{ color: "var(--paper)" }}>{f.name.toUpperCase()}</span>
            </p>
            <div className="swatches" role="group" aria-label="Saveurs">
              {FLAVORS.map((x, i) => (
                <button
                  key={x.slug}
                  type="button"
                  className="swatch"
                  aria-label={x.name}
                  aria-pressed={i === idx}
                  onClick={() => setIdx(i)}
                  style={{
                    background: `radial-gradient(circle, ${x.c} 0 12px, transparent 13px)`,
                    boxShadow: i === idx ? "inset 0 0 0 2px #F4F2EE" : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="hero-stage">
          <div aria-hidden="true" className="hero-ghost" style={{ WebkitTextStroke: `2px ${f.hi}55` }}>
            {f.name.toUpperCase()}
          </div>
          <div
            aria-hidden="true"
            className="halftone"
            style={{ position: "absolute", width: 440, height: 440, borderRadius: "50%", backgroundColor: `${f.c}33`, transition: "background-color .6s" }}
          />
          <div className="float" style={{ position: "relative", filter: `drop-shadow(0 50px 50px ${f.c}80)` }}>
            <Can flavor={f} width={230} />
          </div>
          <div
            style={{
              position: "absolute", top: 70, right: 24, transform: "rotate(6deg)", background: "var(--paper)", color: "var(--ink)",
              padding: "12px 16px 10px", display: "flex", flexDirection: "column", gap: 2, boxShadow: "6px 6px 0 #0A0A0A",
            }}
          >
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.14em" }}>N° {pad(idx)} / 13</span>
            <span className="serif-i" style={{ fontSize: 28, lineHeight: 1 }}>{f.name}</span>
          </div>
          <div
            style={{
              position: "absolute", bottom: 80, left: 24, width: 116, height: 116, borderRadius: "50%", border: "2px dashed var(--paper)",
              transform: "rotate(-14deg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", lineHeight: 1.4, textAlign: "center",
            }}
          >
            PACK 24
            <span className="display" style={{ fontSize: 30, letterSpacing: 0 }}>32 €</span>
          </div>
          <div style={{ position: "absolute", bottom: 24, right: 24, display: "flex", gap: 10 }}>
            <button type="button" className="icon-btn" aria-label="Saveur précédente" onClick={prev}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button type="button" className="icon-btn solid" aria-label="Saveur suivante" onClick={next}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
