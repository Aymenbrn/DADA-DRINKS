"use client";

import Link from "next/link";
import { useState } from "react";
import Can from "./Can";
import CardCan3D from "./CardCan3D";
import { useCart } from "@/components/cart/CartProvider";
import { CAT_LABELS, FLAVORS, PACK_PRICE, flavorHref, mix, pad, type FlavorCategory } from "@/lib/flavors";

const FILTERS: { id: "all" | FlavorCategory; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "fruit", label: "Fruitées" },
  { id: "cola", label: "Colas" },
  { id: "the", label: "Thé glacé" },
];

export default function Flavors() {
  const [cat, setCat] = useState<"all" | FlavorCategory>("all");
  const { add } = useCart();
  const list = FLAVORS.map((f, i) => ({ f, i })).filter(({ f }) => cat === "all" || f.cat === cat);

  return (
    <section id="saveurs" style={{ background: "var(--paper)", color: "var(--ink)", padding: "120px 0 140px" }}>
      <div className="container">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: "1 1 100%" }}>
            <p className="eyebrow" style={{ color: "var(--muted-on-light)" }}>LA BOUTIQUE</p>
            <h2 className="h-xl" style={{ fontSize: "clamp(28px, 6vw, 92px)", whiteSpace: "nowrap" }}>
              13 saveurs.<span className="serif-i"> Zéro règle.</span>
            </h2>
            <p style={{ margin: 0, maxWidth: 460, fontSize: 18, lineHeight: 1.5, color: "var(--muted-on-light)" }}>
              Chaque saveur en pack de 24 canettes, livré chez vous. Mélangez, collectionnez, partagez.
            </p>
          </div>
          <div role="group" aria-label="Filtrer les saveurs" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {FILTERS.map((k) => (
              <button
                key={k.id}
                type="button"
                className="chip"
                aria-pressed={k.id === cat}
                onClick={() => setCat(k.id)}
                style={{ background: k.id === cat ? "var(--ink)" : "transparent", color: k.id === cat ? "var(--paper)" : "var(--ink)" }}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20, marginTop: 56 }}>
          {list.map(({ f, i }) => (
            <article key={f.slug} className="card">
              <Link
                href={flavorHref(f.slug)}
                aria-label={`Voir la fiche Dada ${f.name}`}
                style={{
                  color: "inherit", textDecoration: "none",
                  position: "relative", height: 300, display: "flex", alignItems: "center", justifyContent: "center",
                  background: `radial-gradient(rgba(0,0,0,.07) 1px, transparent 1.5px) 0 0 / 8px 8px, ${mix(f.c, 0.72)}`,
                }}
              >
                <span style={{ position: "absolute", top: 18, left: 20, fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.14em" }}>N°{pad(i)}</span>
                <span className="tag" style={{ top: 14, right: 16, background: "var(--ink)", color: "var(--paper)", transform: "rotate(3deg)" }}>
                  {CAT_LABELS[f.cat].toUpperCase()}
                </span>
                <CardCan3D
                  flavor={f}
                  fogColor={mix(f.c, 0.72)}
                  fallback={
                    <div style={{ transform: "rotate(-7deg)", filter: "drop-shadow(0 22px 22px rgba(0,0,0,0.28))" }}>
                      <Can flavor={f} width={120} />
                    </div>
                  }
                />
              </Link>
              <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 6 }}>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
                  <Link href={flavorHref(f.slug)} style={{ color: "inherit", textDecoration: "none" }}>Dada {f.name}</Link>
                </h3>
                <p className="serif-i" style={{ margin: 0, fontSize: 18, color: "#3F3F46" }}>{f.note}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 20, fontWeight: 800 }}>{PACK_PRICE}</span>
                    <span style={{ fontSize: 13, color: "var(--muted-on-light)" }}>Pack de 24 canettes</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => add(f.slug)}
                    aria-label={`Ajouter un pack de Dada ${f.name} au panier`}
                    style={{ cursor: "pointer",
                      width: 48, height: 48, borderRadius: "50%", border: 0, background: "var(--ink)", color: "var(--paper)",
                      display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
