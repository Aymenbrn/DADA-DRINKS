"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { CAT_LABELS, DEFAULT_PACK, FLAVORS, PACK_SIZES, flavorHref, formatEUR, getFlavor, packCents, pad } from "@/lib/flavors";
import { createShowcase } from "@/lib/can3d/showcase";

/** Section « univers » de la fiche produit : la canette entourée des fruits de la saveur, en 3D. */
export default function FlavorUniverse() {
  const { slug } = useParams<{ slug: string }>();
  const f = getFlavor(slug) ?? FLAVORS[0];
  // Une scène par saveur : on la recrée quand on change de fiche
  return <UniverseScene key={f.slug} slug={f.slug} />;
}


function UniverseScene({ slug }: { slug: string }) {
  const f = getFlavor(slug)!;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const { add, count, openCart } = useCart();
  const [qty, setQty] = useState(1);
  const [pack, setPack] = useState<number>(DEFAULT_PACK);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let scene: ReturnType<typeof createShowcase> | null = null;
    try {
      scene = createShowcase(canvas, { flavor: f, universe: true, shift: 0.17 });
      // la scène s’affiche tout de suite ; l’étiquette se pose dès qu’elle est chargée
      requestAnimationFrame(() => setReady(true));
    } catch {
      setFailed(true);
    }
    return () => scene?.dispose();
    // la scène dépend uniquement de la saveur (clé du composant)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = { "--u": f.c, "--u-hi": f.hi, "--accent": f.hi } as CSSProperties;
  const index = FLAVORS.indexOf(f);

  return (
    <section className="universe" style={style} aria-labelledby="universe-title">
      <div className="pdp-topbar">
        <Link href="/" className="pdp-logo" aria-label="Dada Drinks, accueil">
          <Image src="/brand/dada-logo.webp" alt="Dada" width={750} height={303} className="logo-img" />
        </Link>
        <div className="pdp-topbar-links">
          <Link href="/#saveurs" className="pdp-back">← Retour à la boutique</Link>
          <button type="button" className="pill pill-light" onClick={openCart} aria-haspopup="dialog" aria-label={`Ouvrir le panier, ${count} pack${count > 1 ? "s" : ""}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 7h12l-1 13H7L6 7z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            Panier · {count}
          </button>
        </div>
      </div>
      <nav className="pdp-flavors" aria-label="Choisir une saveur">
        <ul>
          {FLAVORS.map((x) => (
            <li key={x.slug}>
              <Link href={flavorHref(x.slug)} scroll={false} aria-current={x.slug === f.slug ? "page" : undefined}>
                <span className="pdp-dot" style={{ background: x.hi }} />
                {x.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="container universe-inner">
        <div className="universe-copy">
          <p className="pdp-eyebrow">
            DADA DRINKS — {CAT_LABELS[f.cat].toUpperCase()} — N° {pad(index)} / {FLAVORS.length}
          </p>
          <div className="pdp-title-row">
            <h1
              id="universe-title"
              className="h-xl universe-title"
              style={f.name.length > 8 ? { fontSize: "clamp(40px, 4.4vw, 74px)" } : undefined}
            >
              Dada <span className="serif-i universe-name">{f.name}.</span>
            </h1>
          </div>
          <p className="universe-lede">{f.desc}</p>
          <div className="pdp-buy-row">
            <div className="pdp-packs" role="radiogroup" aria-label="Format du pack">
              {PACK_SIZES.map((n) => (
                <button key={n} type="button" role="radio" aria-checked={pack === n} className={pack === n ? "is-on" : undefined} onClick={() => setPack(n)}>
                  <strong>{n}</strong>
                  <span>canettes</span>
                </button>
              ))}
            </div>
            <p className="pdp-price">
              {formatEUR(packCents(pack))}
              <small>le pack de {pack} canettes · 1,33 € la canette</small>
            </p>
            <div className="pdp-qty" role="group" aria-label="Nombre de packs">
              <button type="button" aria-label="Un pack de moins" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span aria-live="polite">{qty}</span>
              <button type="button" aria-label="Un pack de plus" onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
            </div>
            <button type="button" className="pdp-buy" onClick={() => { add(f.slug, qty, pack); setQty(1); }}>
              Ajouter au panier
            </button>
          </div>
          <dl className="pdp-specs">
            <div><dt>FORMAT</dt><dd>Canette</dd></div>
            <div><dt>PACK</dt><dd>{pack} canettes</dd></div>
            <div><dt>SERVICE</dt><dd>Très frais</dd></div>
          </dl>
        </div>
        <div className="universe-stage">
          <canvas
            ref={canvasRef}
            className={`launch-canvas${ready ? " is-ready" : ""}`}
            role="img"
            aria-label={`Canette Dada ${f.name} en 3D, entourée de l’univers de la saveur ; elle se tourne vers le curseur`}
          />
          {failed && <p className="launch-fallback">La 3D n’est pas disponible sur cet appareil.</p>}
        </div>
      </div>
    </section>
  );
}
