"use client";

import { useEffect, useRef, useState } from "react";
import type { FridgeVariant } from "@/lib/can3d/fridge";

/**
 * Produit pro en 3D (vitrine ou palette) dans sa carte. La scène ne vit que lorsque la carte est à l'écran ;
 * en attendant (ou sans WebGL), la photo du produit reste affichée.
 */
export default function Pro3D({ kind, fallback }: { kind: FridgeVariant | "pallet"; fallback: string }) {
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
    const onReady = () => setReady(true);
    const load =
      kind === "pallet"
        ? import("@/lib/can3d/pallet").then(({ createPallet }) => () => createPallet(canvas, { onReady }))
        : import("@/lib/can3d/fridge").then(({ createFridge }) => () => createFridge(canvas, kind, { onReady }));
    load
      .then((make) => {
        if (!cancelled) api = make();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      api?.dispose();
    };
  }, [active, kind]);

  return (
    <div ref={wrapRef} className={`pro3d${ready ? " is-ready" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={fallback} alt="" className="pro3d-fallback" />
      <canvas ref={canvasRef} className="pro3d-canvas" />
    </div>
  );
}
