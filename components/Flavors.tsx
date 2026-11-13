"use client";

import Link from "next/link";
import Can from "./Can";
import CardCan3D from "./CardCan3D";
import { useCart } from "@/components/cart/CartProvider";
import { CAT_LABELS, FLAVORS, PACK_PRICE, flavorHref, mix, pad } from "@/lib/flavors";

/** Assombrit une couleur hex (facteur 0–1) */
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

export default function Flavors() {
  const { add } = useCart();
  const list = FLAVORS.map((f, i) => ({ f, i }));

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
                  background: `radial-gradient(rgba(255,255,255,.10) 1px, transparent 1.5px) 0 0 / 8px 8px, radial-gradient(90% 80% at 50% 40%, ${mix(f.c, 0.18)} 0%, ${f.c} 55%, ${shade(f.c, 0.55)} 100%)`,
                }}
              >
                <span style={{ position: "absolute", top: 18, left: 20, fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.14em", color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.35)" }}>N°{pad(i)}</span>
                <span className="tag" style={{ top: 14, right: 16, background: "var(--ink)", color: "var(--paper)", transform: "rotate(3deg)" }}>
                  {CAT_LABELS[f.cat].toUpperCase()}
                </span>
                <CardCan3D
                  flavor={f}
                  fogColor={f.c}
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
