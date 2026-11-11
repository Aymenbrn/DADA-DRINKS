"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { CAT_LABELS, FLAVORS, PACK_PRICE, flavorHref, getFlavor, pad } from "@/lib/flavors";
import { createCanScene } from "@/lib/can3d/engine";
import { useCart } from "@/components/cart/CartProvider";

type Engine = ReturnType<typeof createCanScene>;
type View = "v-front" | "v-side" | "v-top";

/** Fiche produit : canette 3D (transparente, boisson qui ballotte, mode « Verser ») + infos de la saveur. */
export default function ProductView() {
  // La vue vit dans le layout de /saveurs : elle persiste d'une saveur à l'autre (pas de rechargement 3D)
  const { slug } = useParams<{ slug: string }>();
  const f = getFlavor(slug) ?? FLAVORS[0];
  const index = FLAVORS.indexOf(f);
  const prev = FLAVORS[(index + FLAVORS.length - 1) % FLAVORS.length];
  const next = FLAVORS[(index + 1) % FLAVORS.length];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const firstFlavor = useRef(true);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const navRef = useRef<HTMLUListElement>(null);

  const [status, setStatus] = useState<string | null>("CHARGEMENT DE LA CANETTE…");
  const [pouring, setPouring] = useState(false);
  const [spin, setSpin] = useState(true);
  const [view, setView] = useState<View | null>("v-front");
  const [toast, setToast] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  // Création / destruction de la scène 3D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let engine: Engine | null = null;
    try {
      engine = createCanScene(canvas, {
        flavor: f,
        assetBase: "/labels",
        onReady: () => setStatus(null),
        onError: (msg: string) => setStatus(msg),
      });
    } catch {
      setStatus("LA 3D N’EST PAS DISPONIBLE SUR CET APPAREIL");
      return;
    }
    engineRef.current = engine;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) setSpin(false);
    return () => {
      engine?.dispose();
      engineRef.current = null;
    };
    // La scène est créée une seule fois ; les changements de saveur passent par setFlavor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Changement de saveur (navigation entre fiches sans recréer la scène)
  useEffect(() => {
    if (firstFlavor.current) {
      firstFlavor.current = false;
      return;
    }
    engineRef.current?.setFlavor(f);
    navRef.current
      ?.querySelector<HTMLAnchorElement>(`a[data-slug="${f.slug}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [f]);

  useEffect(() => { engineRef.current?.setPouring(pouring); }, [pouring]);
  useEffect(() => { engineRef.current?.setSpin(spin); }, [spin]);

  // Le nom de la saveur tient toujours sur une seule ligne
  useLayoutEffect(() => {
    const h1 = titleRef.current;
    if (!h1) return;
    const fit = () => {
      h1.style.fontSize = "";
      const em = h1.querySelector("em");
      if (!em) return;
      let size = parseFloat(getComputedStyle(h1).fontSize);
      while (em.scrollWidth > h1.clientWidth && size > 24) {
        size -= 2;
        h1.style.fontSize = `${size}px`;
      }
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [f]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const pickView = (v: View) => {
    setView(v);
    setSpin(false);
    engineRef.current?.setView(v);
  };
  const togglePour = () => {
    const on = !pouring;
    setPouring(on);
    setView("v-front");
    if (on) setSpin(false);
  };

  return (
    <section className="pdp" aria-label={`Dada ${f.name}`} style={{ "--accent": f.hi } as CSSProperties}>
      <canvas
        ref={canvasRef}
        className="pdp-canvas"
        aria-label={`Canette Dada ${f.name} en 3D. Faites glisser pour la tourner et la secouer.`}
      />
      {status && <p className="pdp-status">{status}</p>}

      <nav className="pdp-flavors" aria-label="Choisir une saveur">
        <ul ref={navRef}>
          {FLAVORS.map((x) => (
            <li key={x.slug}>
              <Link href={flavorHref(x.slug)} scroll={false} data-slug={x.slug} aria-current={x.slug === f.slug ? "page" : undefined}>
                <span className="pdp-dot" style={{ background: x.hi }} />
                {x.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pdp-copy">
        <p className="pdp-eyebrow">
          DADA DRINKS — {CAT_LABELS[f.cat].toUpperCase()} — N° {pad(index)} / {FLAVORS.length}
        </p>
        <div className="pdp-title-row">
          <h1 ref={titleRef} className="pdp-title">
            Dada <em>{f.name}.</em>
          </h1>
          <div className="pdp-nav-pair">
            <Link href={flavorHref(prev.slug)} scroll={false} className="pdp-nav-btn" aria-label={`Saveur précédente : ${prev.name}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            </Link>
            <Link href={flavorHref(next.slug)} scroll={false} className="pdp-nav-btn" aria-label={`Saveur suivante : ${next.name}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
            </Link>
          </div>
        </div>
        {!f.art && <p className="pdp-badge">ILLUSTRATION DU FRUIT PROVISOIRE</p>}
        <p className="pdp-lede">
          {pouring ? "Baladez la canette avec la souris : le jet suit vos gestes, éclabousse et fait une flaque." : f.desc}
        </p>
        <div className="pdp-buy-row">
          <p className="pdp-price">
            {PACK_PRICE}
            <small>le pack de 24 canettes · 1,33 € la canette</small>
          </p>
          <div className="pdp-qty" role="group" aria-label="Nombre de packs">
            <button type="button" aria-label="Un pack de moins" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span aria-live="polite">{qty}</span>
            <button type="button" aria-label="Un pack de plus" onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
          </div>
          <button type="button" className="pdp-buy" onClick={() => { add(f.slug, qty); setQty(1); }}>
            Ajouter au panier
          </button>
        </div>
        <dl className="pdp-specs">
          <div><dt>FORMAT</dt><dd>Canette</dd></div>
          <div><dt>PACK</dt><dd>24 canettes</dd></div>
          <div><dt>SERVICE</dt><dd>Très frais</dd></div>
        </dl>
        <details className="pdp-ingr">
          <summary>INGRÉDIENTS</summary>
          <p>{f.ingr ?? "Non indiqués sur le site actuel : à compléter avec Dada."}</p>
        </details>
      </div>

      {toast && <p className="pdp-toast" role="status">{toast}</p>}

      <div className="pdp-controls" role="group" aria-label="Vues de la canette">
        <button type="button" aria-pressed={view === "v-front"} onClick={() => pickView("v-front")}>Face</button>
        <button type="button" aria-pressed={view === "v-side"} onClick={() => pickView("v-side")}>Profil</button>
        <button type="button" aria-pressed={view === "v-top"} onClick={() => pickView("v-top")}>Dessus</button>
        <button type="button" aria-pressed={spin} onClick={() => setSpin((s) => !s)}>Rotation auto</button>
        <button type="button" aria-pressed={pouring} onClick={togglePour}>{pouring ? "Refermer" : "Verser"}</button>
      </div>
    </section>
  );
}
