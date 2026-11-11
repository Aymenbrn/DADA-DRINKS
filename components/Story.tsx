"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CHAPTERS, css, makePoem } from "@/lib/story";

/** Distance de défilement (px) consacrée à chaque acte */
const STEP = 650;
const MAX_STICKY = 860;

export default function Story() {
  const ref = useRef<HTMLElement>(null);
  const [prog, setProg] = useState(0);
  const [seed, setSeed] = useState(7);

  // Le défilement pilote la progression (0 → 1) dans la section
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const range = r.height - Math.min(window.innerHeight, MAX_STICKY);
      if (range <= 0) return;
      setProg(Math.max(0, Math.min(1, -r.top / range)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const last = CHAPTERS.length - 1;
  const ch = Math.min(last, Math.round(prog * last));
  const local = Math.max(0, Math.min(1, prog * last - ch + 0.5)); // progression dans l'acte courant
  const cur = CHAPTERS[ch];
  const rgb = cur.ink === "#0A0A0A" ? "10,10,10" : "244,242,238";
  const poem = useMemo(() => makePoem(seed), [seed]);

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY + i * STEP;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section
      id="histoire"
      ref={ref}
      className="story"
      aria-labelledby="histoire-titre"
      style={{ background: cur.bg, color: cur.ink }}
    >
      <div className="story-sticky">
        <div aria-hidden="true" style={{ height: 3, flex: "0 0 3px", background: `rgba(${rgb},.18)` }}>
          <div style={{ height: 3, width: `${prog * 100}%`, background: cur.ink }} />
        </div>

        <div className="container story-inner">
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: "1 1 520px" }}>
              <p className="eyebrow" style={{ color: cur.muted }}>L’HISTOIRE DADA — EN 6 ACTES</p>
              <h2 id="histoire-titre" className="h-xl" style={{ fontSize: "clamp(36px, 4.2vw, 60px)", lineHeight: 0.95 }}>
                Avant la canette,<span className="serif-i"> il y avait un cri.</span>
              </h2>
            </div>
            <p aria-hidden="true" className="eyebrow" style={{ fontSize: 12, color: cur.muted, display: "flex", gap: 10, alignItems: "center" }}>
              FAIS DÉFILER <span className="bob" style={{ fontSize: 18 }}>↓</span>
            </p>
          </div>

          <div className="story-row">
            <div className="story-text" aria-live="polite">
              <p className="eyebrow" style={{ color: cur.muted }}>{cur.kicker} / 06</p>
              <p className="story-big">{cur.big}</p>
              <h3 className="story-title">{cur.title}</h3>
              <p className="story-body" style={{ color: cur.muted }}>{cur.body}</p>
              {cur.poem && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                    <button type="button" className="btn btn-dark" onClick={() => setSeed((s) => s + 1)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="4" y="4" width="16" height="16" rx="3" />
                        <circle cx="9" cy="9" r="1.2" fill="currentColor" />
                        <circle cx="15" cy="15" r="1.2" fill="currentColor" />
                        <circle cx="15" cy="9" r="1.2" fill="currentColor" />
                        <circle cx="9" cy="15" r="1.2" fill="currentColor" />
                      </svg>
                      Secoue le sac
                    </button>
                    <a href="#saveurs" className="btn btn-ghost" style={{ color: "#0A0A0A" }}>Trouve ta saveur →</a>
                  </div>
                  <p style={{ margin: 0, fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.6 }}>
                    TON POÈME : {poem.map((p) => p[0]).join(" / ")}
                  </p>
                </div>
              )}
            </div>

            <div className="story-stage" style={{ border: `1.5px solid rgba(${rgb},.18)` }}>
              {CHAPTERS.map((c, i) => {
                const active = i === ch;
                const pieces = c.poem ? poem : c.pieces;
                return (
                  <div
                    key={c.kicker}
                    aria-hidden="true"
                    className={c.poem ? "poem-layer" : undefined}
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: active ? "auto" : "none",
                      transition: "transform .25s linear",
                      transform: active ? `translateY(${((0.5 - local) * 40).toFixed(1)}px) scale(${(1 + local * 0.05).toFixed(3)})` : "none",
                    }}
                  >
                    {pieces.map((p, j) => (
                      <span
                        key={`${p[0]}-${j}`}
                        className="piece"
                        style={{
                          ...css(p[1]),
                          translate: active ? "0 0" : "0 70px",
                          opacity: active ? 1 : 0,
                          transition: `translate .8s cubic-bezier(.2,.8,.2,1) ${active ? j * 70 : 0}ms, opacity .5s ease ${active ? j * 70 : 0}ms`,
                        }}
                      >
                        {p[0]}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="story-tabs" role="group" aria-label="Les six actes">
            {CHAPTERS.map((c, i) => (
              <button key={c.kicker} type="button" className="story-tab" aria-current={i === ch ? "step" : undefined} onClick={() => goTo(i)}>
                <span
                  style={{
                    display: "block", width: "100%", height: 4, borderRadius: 2, transition: "background-color .5s",
                    background: i === ch ? cur.ink : i < ch ? `rgba(${rgb},.45)` : `rgba(${rgb},.15)`,
                  }}
                />
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.14em", color: i === ch ? cur.ink : cur.muted }}>
                  {c.year.toUpperCase()}
                </span>
                <span style={{ fontSize: 15, fontWeight: i === ch ? 700 : 500, color: i === ch ? cur.ink : cur.muted }}>{c.tab}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
