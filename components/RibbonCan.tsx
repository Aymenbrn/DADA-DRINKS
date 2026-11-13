"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Flavor } from "@/lib/flavors";

const cache = new Map<string, Promise<string>>();

/** Face avant de l'étiquette « accueil » (grand logo DADA) en image, mise en cache par saveur */
function frontImage(f: Flavor) {
  let p = cache.get(f.slug);
  if (!p) {
    p = import("@/lib/can3d/labels").then(async ({ getRibbonLabel }) => {
      const label = await getRibbonLabel(f);
      const k = label.width / 2048;
      const sx = 192 * k, sw = 640 * k; // la face visible, centrée sur le logo
      const c = document.createElement("canvas");
      c.width = 240;
      c.height = Math.round((240 * label.height) / sw);
      c.getContext("2d")!.drawImage(label, sx, 0, sw, label.height, 0, 0, c.width, c.height);
      return c.toDataURL("image/webp", 0.85);
    });
    cache.set(f.slug, p);
  }
  return p;
}

/** Canette simple (2D) au design de l'accueil, pour le panier */
export default function RibbonCan({ flavor, width = 34 }: { flavor: Flavor; width?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    frontImage(flavor).then((s) => alive && setSrc(s)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [flavor]);

  return (
    <span className="rcan" style={{ width, "--c": flavor.c } as CSSProperties} aria-hidden="true">
      <span className="rcan-top" />
      {/* eslint-disable-next-line @next/next/no-img-element -- image générée dans le navigateur */}
      <span className="rcan-body">{src && <img src={src} alt="" />}</span>
      <span className="rcan-bottom" />
    </span>
  );
}
