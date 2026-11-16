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
          // texte noir / gris foncé : passé en blanc pour rester lisible sur fond noir
          else if (max < 90 && max - min < 40) {
            const k = 1 - max / 90;
            p[i] = p[i + 1] = p[i + 2] = Math.round(max + (240 - max) * k);
          }
        }
        g.putImageData(d, 0, 0);
        resolve(c.toDataURL("image/png"));
      } catch {
        resolve(src);
      }
    };
    im.onerror = () => resolve(src);
    im.src = src;
  });
}

/** Logos officiels sans fond, en défilement automatique (pause au survol) */
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
