"use client";

import { useEffect, useRef, useState } from "react";
import { getFlavor } from "@/lib/flavors";

/** Bras 3D qui lève une canette Dada (en-tête de la page Collaborations) */
export default function HeroArm({ slug = "cola-cherry" }: { slug?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    const f = getFlavor(slug);
    if (!canvas || !f) return;
    let scene: { dispose(): void } | null = null;
    let cancelled = false;
    import("@/lib/can3d/arm")
      .then(({ createArm }) => {
        if (cancelled) return;
        try {
          scene = createArm(canvas, f, { onReady: () => setReady(true) });
        } catch {
          // pas de WebGL : on n'affiche rien
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      scene?.dispose();
    };
  }, [slug]);
  return <canvas ref={ref} className={`hero-arm${ready ? " is-ready" : ""}`} aria-hidden="true" />;
}
