// Étiquettes dépliées des canettes, pour la vitrine 3D (face avant centrée à u = 0,25).
//  - Cola Cherry : visuel officiel (canette prune, grand logo DADA).
//  - Cola, Cola Zero : même design officiel, recoloré à la couleur de la saveur, avec leur nom.
//  - Saveurs fruitées et Ice Tea : gabarit tiré de l'étiquette Cerise (fond noir, feuillages),
//    avec le nom et le fruit de chaque saveur — la même étiquette que sur la scène produit.
import type { Flavor } from "@/lib/flavors";

const BASE = "/labels";
const OFFICIAL = `${BASE}/cola-cherry-label.jpg`;
const TEMPLATE = `${BASE}/label-template.png`;
const PLUM = [137, 45, 115];

const cache = new Map<string, Promise<HTMLCanvasElement | HTMLImageElement>>();

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = src;
  });
}

/** Police des noms de saveur (posée par next/font dans app/layout.tsx) */
function labelFont() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-montserrat").trim();
  return v || "Montserrat";
}

async function fontsReady() {
  try {
    await document.fonts?.load(`900 88px ${labelFont()}`);
  } catch {
    // police de secours
  }
}

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Design officiel recoloré (Cola, Cola Zero) */
async function recolored(f: Flavor) {
  const [img] = await Promise.all([loadImg(OFFICIAL), fontsReady()]);
  const W = img.width, H = img.height;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(img, 0, 0);
  const data = g.getImageData(0, 0, W, H);
  const px = data.data;
  const [tr, tg, tb] = hexToRgb(f.c);
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], gg = px[i + 1], b = px[i + 2];
    if (r > 170 && gg > 140 && b < 100) continue; // le croissant jaune du logo reste tel quel
    const a = Math.min(1, Math.max(0, (gg - 45) / (232 - 45))); // part de blanc (logo, texte)
    let s = 1;
    if (a < 0.08) s = Math.min(1.35, Math.max(0.7, (r / PLUM[0] + b / PLUM[2]) / 2)); // nuances du métal
    px[i] = a * 236 + (1 - a) * tr * s;
    px[i + 1] = a * 236 + (1 - a) * tg * s;
    px[i + 2] = a * 238 + (1 - a) * tb * s;
  }
  g.putImageData(data, 0, 0);

  // Remplace « COLA CHERRY » par le nom de la saveur, sur les deux faces de la canette
  const k = W / 2048;
  g.font = `900 ${46 * k}px ${labelFont()}, system-ui, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (const off of [0, 1024]) {
    g.fillStyle = f.c;
    g.fillRect((300 + off) * k, 1440 * k, 480 * k, 96 * k);
    g.fillStyle = "#ecebef";
    g.fillText(f.name.toUpperCase(), (540 + off) * k, 1500 * k);
  }
  return c;
}

/** Gabarit noir (saveurs fruitées, Ice Tea) */
async function fromTemplate(f: Flavor) {
  const [img] = await Promise.all([loadImg(TEMPLATE), fontsReady()]);
  const art = f.slug === "cerise" && f.label ? await loadImg(f.label) : null;
  const W = img.width, H = img.height, half = W / 2, k = W / 1600;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#050505";
  g.fillRect(0, 0, W, H);
  g.drawImage(img, 0, 0);

  const font = labelFont();
  const line = (txt: string, y: number, maxW: number, size: number) => {
    g.font = `900 ${size}px ${font}, system-ui, sans-serif`;
    const w = g.measureText(txt).width;
    g.save();
    g.translate(0, y);
    g.scale(Math.min(1, maxW / w), 1);
    g.shadowColor = "rgba(0,0,0,0.7)";
    g.shadowBlur = 8 * k;
    g.shadowOffsetY = 4 * k;
    g.fillStyle = "#ffffff";
    g.fillText(txt, 0, 0);
    g.restore();
  };
  g.textAlign = "center";
  g.textBaseline = "middle";

  for (const off of [0, half]) {
    if (art) {
      const sx = art.width / 1600;
      g.drawImage(art, 232 * sx, 712 * sx, 374 * sx, 366 * sx, off + 232 * k, 712 * k, 374 * k, 366 * k);
    } else {
      const fx = off + 420 * k, fy = 868 * k, fr = 128 * k;
      g.save();
      g.shadowColor = "rgba(0,0,0,0.55)";
      g.shadowBlur = 24 * k;
      g.shadowOffsetY = 10 * k;
      const grd = g.createRadialGradient(fx - fr * 0.4, fy - fr * 0.45, fr * 0.05, fx, fy, fr);
      grd.addColorStop(0, "#ffffff");
      grd.addColorStop(0.35, f.hi);
      grd.addColorStop(1, `rgb(${f.rgb})`);
      g.fillStyle = grd;
      g.beginPath();
      g.arc(fx, fy, fr, 0, Math.PI * 2);
      g.fill();
      g.restore();
      g.fillStyle = "rgba(255,255,255,0.55)";
      g.beginPath();
      g.ellipse(fx - fr * 0.38, fy - fr * 0.42, fr * 0.22, fr * 0.12, -0.6, 0, Math.PI * 2);
      g.fill();
      g.save();
      g.translate(fx + fr * 0.15, fy - fr * 0.95);
      g.rotate(-0.5);
      g.fillStyle = "#3f9a3a";
      g.beginPath();
      g.ellipse(0, 0, fr * 0.42, fr * 0.16, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
    g.save();
    g.translate(off + 395 * k, 620 * k);
    g.rotate(-0.05);
    line(f.name.toUpperCase(), -40 * k, 400 * k, 88 * k);
    line(f.en.toUpperCase(), 42 * k, 370 * k, 80 * k);
    g.restore();
  }
  return c;
}

/** Image de l'étiquette d'une saveur (mise en cache) */
export function getLabelImage(f: Flavor) {
  let p = cache.get(f.slug);
  if (!p) {
    p =
      f.slug === "cola-cherry"
        ? loadImg(OFFICIAL)
        : f.cat === "cola"
          ? recolored(f)
          : fromTemplate(f);
    cache.set(f.slug, p);
  }
  return p;
}
