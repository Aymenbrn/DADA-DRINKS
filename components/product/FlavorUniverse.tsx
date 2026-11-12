"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { CAT_LABELS, FLAVORS, PACK_PRICE, getFlavor } from "@/lib/flavors";
import { createShowcase } from "@/lib/can3d/showcase";

/** Section « univers » de la fiche produit : la canette entourée des fruits de la saveur, en 3D. */
export default function FlavorUniverse() {
  const { slug } = useParams<{ slug: string }>();
  const f = getFlavor(slug) ?? FLAVORS[0];
  // Une scène par saveur : on la recrée quand on change de fiche
  return <UniverseScene key={f.slug} slug={f.slug} />;
}

const UNIVERSE_TEXT: Record<string, string> = {
  fruit: "Ses fruits, sa couleur, ses bulles : passez la souris pour entrer dans l’univers de la saveur.",
  cola: "Des glaçons, des bulles, et la canette au centre : passez la souris pour la faire tourner.",
  the: "Pêche, feuilles de thé et glaçons : passez la souris pour entrer dans l’univers de la saveur.",
};

function UniverseScene({ slug }: { slug: string }) {
  const f = getFlavor(slug)!;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const { add } = useCart();

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

  const style = { "--u": f.c, "--u-hi": f.hi } as CSSProperties;

  return (
    <section className="universe" style={style} aria-labelledby="universe-title">
      <div className="container universe-inner">
        <div className="universe-copy">
          <p className="eyebrow universe-eyebrow">L’UNIVERS {f.name.toUpperCase()}</p>
          <h2 id="universe-title" className="h-xl universe-title">
            Dada <span className="serif-i">{f.name}.</span>
          </h2>
          <p className="universe-lede">{UNIVERSE_TEXT[f.cat]}</p>
          <dl className="launch-specs">
            <div><dt>Gamme</dt><dd>{CAT_LABELS[f.cat]}</dd></div>
            <div><dt>Pack</dt><dd>24 canettes</dd></div>
            <div><dt>Prix</dt><dd>{PACK_PRICE}</dd></div>
          </dl>
          <div className="hero-actions">
            <button type="button" className="btn universe-btn" onClick={() => add(f.slug)}>Ajouter au panier</button>
          </div>
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
