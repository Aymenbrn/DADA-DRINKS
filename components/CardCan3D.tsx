"use client";

import { useEffect, useRef, useState } from "react";
import type { Flavor } from "@/lib/flavors";
import { createShowcase } from "@/lib/can3d/showcase";

/**
 * Canette 3D d'une saveur, avec son univers (fruits, bulles), dans une carte de la boutique.
 * La scène n'existe que lorsque la carte est à l'écran (au plus quelques contextes WebGL à la fois) ;
 * tant qu'elle se prépare, le visuel 2D passé en `fallback` reste affiché.
 */
export default function CardCan3D({ flavor, fogColor, fallback }: { flavor: Flavor; fogColor: string; fallback: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  // Monte la scène à l'approche de l'écran, la libère quand la carte s'éloigne
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        window.clearTimeout(timer);
        if (e.isIntersecting) setActive(true);
        else timer = window.setTimeout(() => setActive(false), 1200);
      },
      { rootMargin: "150px 0px" }
    );
    io.observe(el);
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!active) {
      setReady(false);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    let scene: ReturnType<typeof createShowcase> | null = null;
    try {
      scene = createShowcase(canvas, { flavor, universe: true, cardMode: true, fogColor, localPointer: true, onReady: () => setReady(true) });
      const id = window.setTimeout(() => setReady(true), 900);
      return () => {
        window.clearTimeout(id);
        scene?.dispose();
      };
    } catch {
      return () => scene?.dispose();
    }
  }, [active, flavor, fogColor]);

  return (
    <div ref={wrapRef} className={`card-can3d${ready ? " is-ready" : ""}`}>
      <div className="card-can3d-fallback">{fallback}</div>
      {active && <canvas ref={canvasRef} className="card-can3d-canvas" aria-hidden="true" />}
    </div>
  );
}
