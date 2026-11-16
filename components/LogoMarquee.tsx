"use client";

import { useEffect, useState } from "react";

type Logo = { name: string; logo: string };

/** Retire le fond blanc d'un logo (pixels clairs → transparents, bords adoucis). En cas d'échec, le logo d'origine est gardé. */
function knockOutWhite(src: string): Promise<string> {
  return new Promise((resolve) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = im.naturalWidth;
        c.height = im.naturalHeight;
        const g = c.getContext("2d", { willReadFrequently: true })!;
        g.drawImage(im, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height);
        const p = d.data;
        for (let i = 0; i < p.length; i += 4) {
          const min = Math.min(p[i], p[i + 1], p[i + 2]);
          const max = Math.max(p[i], p[i + 1], p[i + 2]);
          // blanc / gris très clair et peu saturé : transparent (fondu entre 225 et 250)
          if (max - min < 28 && min > 225) {
            p[i + 3] = Math.round(p[i + 3] * Math.max(0, Math.min(1, (250 - min) / 25)));
          }
        }
        g.putImageData(d, 0, 0);
        // recadrage au plus près du logo (les fichiers d'origine ont beaucoup de marge blanche)
        let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
        for (let y = 0; y < c.height; y++) {
          for (let x = 0; x < c.width; x++) {
            if (p[(y * c.width + x) * 4 + 3] > 24) {
              if (x < x0) x0 = x;
              if (x > x1) x1 = x;
              if (y < y0) y0 = y;
              if (y > y1) y1 = y;
            }
          }
        }
        if (x1 < 0) return resolve(c.toDataURL("image/png"));
        const pad = 2, w = x1 - x0 + 1 + pad * 2, h = y1 - y0 + 1 + pad * 2;
        const o = document.createElement("canvas");
        o.width = w;
        o.height = h;
        o.getContext("2d")!.drawImage(c, x0 - pad, y0 - pad, w, h, 0, 0, w, h);
        resolve(o.toDataURL("image/png"));
      } catch {
        resolve(src);
      }
    };
    im.onerror = () => resolve(src);
    im.src = src;
  });
}

/** Logos officiels sans fond, en défilement automatique (le défilement continue au survol) */
export default function LogoMarquee({ logos }: { logos: Logo[] }) {
  const [srcs, setSrcs] = useState<string[] | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.all(logos.map((l) => knockOutWhite(l.logo))).then((s) => alive && setSrcs(s));
    return () => {
      alive = false;
    };
  }, [logos]);

  const list = [...logos, ...logos];
  return (
    <div className={`logo-marquee${srcs ? " is-ready" : ""}`} aria-label="Enseignes qui référencent Dada">
      <ul className="logo-track">
        {list.map((r, i) => {
          const k = i % logos.length;
          return (
            <li key={`${r.name}-${i}`} aria-hidden={i >= logos.length ? true : undefined}>
              {srcs && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={srcs[k]} alt={i < logos.length ? r.name : ""} decoding="async" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
