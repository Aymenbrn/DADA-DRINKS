"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Palette mixte en 3D dans la carte de l'offre pro. La scène ne vit que lorsque la carte est à l'écran ;
 * en attendant (ou sans WebGL), l'image à plat de la palette reste affichée.
 */
export default function Pallet3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

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
    let api: { dispose: () => void } | null = null;
    let cancelled = false;
    import("@/lib/can3d/pallet")
      .then(({ createPallet }) => {
        if (cancelled) return;
        api = createPallet(canvas, { onReady: () => setReady(true) });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      api?.dispose();
    };
  }, [active]);

  return (
    <div ref={wrapRef} className={`pallet3d${ready ? " is-ready" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/pro/palette.webp" alt="" className="pallet3d-fallback" />
      <canvas ref={canvasRef} className="pallet3d-canvas" />
    </div>
  );
}
