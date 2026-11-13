"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { FROM_PRICE, PACK_RANGE, flavorHref, getFlavor } from "@/lib/flavors";
import { createShowcase } from "@/lib/can3d/showcase";

/** Nouveauté de l'accueil : la Dada Cola Cherry en 3D, qui réagit discrètement à la souris. */
export default function NewLaunch() {
  const f = getFlavor("cola-cherry")!;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const { add } = useCart();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let scene: ReturnType<typeof createShowcase> | null = null;
    try {
      scene = createShowcase(canvas, { flavor: f });
      // la scène s’affiche tout de suite ; l’étiquette se pose dès qu’elle est chargée
      requestAnimationFrame(() => setReady(true));
    } catch {
      setFailed(true);
    }
    return () => scene?.dispose();
  }, []);

  return (
    <section className="launch" aria-labelledby="launch-title">
      <div className="container launch-inner">
        <div className="launch-copy">
          <p className="eyebrow launch-eyebrow">NOUVEAUTÉ</p>
          <h2 id="launch-title" className="h-xl launch-title">
            Dada <span className="serif-i">Cola Cherry.</span>
          </h2>
          <p className="launch-lede">{f.desc}</p>
          <dl className="launch-specs">
            <div><dt>Format</dt><dd>Canette 33 cl</dd></div>
            <div><dt>Packs</dt><dd>{PACK_RANGE}</dd></div>
            <div><dt>Prix</dt><dd>dès {FROM_PRICE}</dd></div>
          </dl>
          <div className="hero-actions">
            <button type="button" className="btn launch-btn" onClick={() => add(f.slug)}>Ajouter au panier</button>
            <Link href={flavorHref(f.slug)} className="btn btn-ghost">Voir la fiche</Link>
          </div>
        </div>
        <div className="launch-stage">
          <canvas
            ref={canvasRef}
            className={`launch-canvas${ready ? " is-ready" : ""}`}
            aria-label="Canette Dada Cola Cherry en 3D, qui se tourne vers le curseur"
            role="img"
          />
          {failed && <p className="launch-fallback">La 3D n’est pas disponible sur cet appareil.</p>}
        </div>
      </div>
    </section>
  );
}
