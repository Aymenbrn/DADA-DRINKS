export type FlavorCategory = "fruit" | "cola" | "the";

export type Flavor = {
  slug: string;
  /** Nom français (première ligne de l'étiquette) */
  name: string;
  /** Nom anglais (deuxième ligne de l'étiquette) */
  en: string;
  cat: FlavorCategory;
  /** Couleur principale de la canette dessinée en CSS (accueil) */
  c: string;
  /** Couleur du texte imprimé sur la canette CSS */
  ink: string;
  /** Variante claire, lisible sur fond noir (titres, accents) */
  hi: string;
  /** Couleur du halo (r,g,b) derrière la canette 3D */
  rgb: string;
  /** Boisson 3D : couleur du liquide, de sa profondeur et de sa surface */
  liq: number;
  atten: number;
  surf: number;
  /** Boisson foncée (colas) : moins transparente */
  dark?: boolean;
  /** Étiquette avec la vraie illustration du fruit (sinon fruit stylisé provisoire) */
  art?: boolean;
  label?: string;
  /** Étiquette complète déjà dépliée (photo officielle), utilisée telle quelle sur la canette 3D */
  labelFull?: string;
  /** Accroche courte (cartes de l'accueil) */
  note: string;
  /** Description de la fiche produit (d'après le site actuel) */
  desc: string;
  /** Ingrédients tels qu'indiqués sur le site actuel ; null = non indiqués */
  ingr: string | null;
};

// Ingrédients indiqués sur dadadrinks.com pour les eaux fruitées.
// ⚠️ La même liste (avec « arôme naturel de pomme ») figure sur toutes ces fiches : à vérifier avec Dada.
const I_FRUIT =
  "Eau, fructose, acide citrique, acide malique, arôme naturel de pomme, sorbate de potassium, citrate de sodium, sucralose.";

// ⚠️ Les couleurs sont des propositions : à caler sur les vrais packagings Dada.
export const FLAVORS: Flavor[] = [
  {
    slug: "cola-cherry", name: "Cola Cherry", en: "Cherry Cola", cat: "cola",
    c: "#892D73", ink: "#FFFFFF", hi: "#E58AD0", rgb: "137,45,115",
    liq: 0x6a1420, atten: 0x200308, surf: 0x8a2030, dark: true, art: true, labelFull: "/labels/cola-cherry-label.webp",
    note: "Cola, cerise, caractère.",
    desc: "Un cola aux notes de cerise intensément fruitées. À savourer bien frais.",
    ingr: null,
  },
  {
    slug: "cerise", name: "Cerise", en: "Cherry", cat: "fruit",
    c: "#D7192D", ink: "#FFFFFF", hi: "#FF6B7A", rgb: "215,25,45",
    liq: 0xff3a50, atten: 0x6e0012, surf: 0xff4f66, art: true, label: "/labels/cerise-label-alpha.webp",
    note: "Rouge, franche, pétillante.",
    desc: "Eau pétillante aromatisée à la cerise. Rouge profond, goût de cerise mûre entre douceur et acidité. À boire très frais.",
    ingr: I_FRUIT,
  },
  {
    slug: "mangue", name: "Mangue", en: "Mango", cat: "fruit",
    c: "#FF9F1C", ink: "#1A0F00", hi: "#FFB547", rgb: "255,150,20",
    liq: 0xffa62b, atten: 0x9a4a00, surf: 0xffc04d,
    note: "Le soleil en canette.",
    desc: "Eau pétillante aromatisée à la mangue. Ronde, solaire et juteuse. À boire très frais.",
    ingr: I_FRUIT,
  },
  {
    slug: "lychee", name: "Lychee", en: "Lychee", cat: "fruit",
    c: "#F49AC1", ink: "#3A0A22", hi: "#F7A8CB", rgb: "240,120,170",
    liq: 0xffcfe0, atten: 0xc0577e, surf: 0xffdce8,
    note: "Floral et inattendu.",
    desc: "Eau pétillante aromatisée au lychee. Un fruit tropical aux notes florales, acidulées et sucrées, pour sortir des saveurs habituelles.",
    ingr: I_FRUIT,
  },
  {
    slug: "mojito", name: "Mojito", en: "Mojito", cat: "fruit",
    c: "#2BCB6E", ink: "#04230F", hi: "#4ADE80", rgb: "60,200,110",
    liq: 0xc9f2b0, atten: 0x3f8f2a, surf: 0xd8f8c4,
    note: "Menthe, citron vert, fraîcheur.",
    desc: "Eau pétillante aromatisée au mojito : la fraîcheur de la menthe et du citron vert. À boire très frais.",
    ingr: I_FRUIT,
  },
  {
    slug: "fraise", name: "Fraise", en: "Strawberry", cat: "fruit",
    c: "#FF3D68", ink: "#FFFFFF", hi: "#FF7593", rgb: "255,60,100",
    liq: 0xff4a6e, atten: 0x9a0f2a, surf: 0xff6a86,
    note: "Gourmande et acidulée.",
    desc: "Eau pétillante aromatisée à la fraise. Gourmande et acidulée. À boire très frais.",
    ingr: I_FRUIT,
  },
  {
    slug: "melon", name: "Melon", en: "Melon", cat: "fruit",
    c: "#F7C873", ink: "#2A1600", hi: "#F7C873", rgb: "245,170,80",
    liq: 0xffbf7a, atten: 0xb8621c, surf: 0xffcc92,
    note: "Doux, juteux, estival.",
    desc: "Eau pétillante aromatisée au melon. Douce et juteuse, faite pour les journées ensoleillées.",
    ingr: I_FRUIT,
  },
  {
    slug: "peche", name: "Pêche", en: "Peach", cat: "fruit",
    c: "#FF8A5B", ink: "#2A0E00", hi: "#FFA27F", rgb: "255,130,90",
    liq: 0xffa985, atten: 0xb44a24, surf: 0xffbb9c,
    note: "Veloutée et pétillante.",
    desc: "Eau pétillante aromatisée à la pêche. Veloutée et pétillante. À boire très frais.",
    ingr: I_FRUIT,
  },
  {
    slug: "pomme", name: "Pomme", en: "Apple", cat: "fruit",
    c: "#7ED957", ink: "#0E2A00", hi: "#9BE77A", rgb: "150,210,60",
    liq: 0xe2f28e, atten: 0x7c9a1c, surf: 0xeaf6a8,
    note: "Verte, vive, croquante.",
    desc: "Boisson pétillante aromatisée à la pomme. Vive et désaltérante, idéale l’été.",
    ingr: I_FRUIT,
  },
  {
    slug: "lemon", name: "Lemon", en: "Lemon", cat: "fruit",
    c: "#FFE14D", ink: "#2A2300", hi: "#FFE66B", rgb: "250,215,40",
    liq: 0xfff08a, atten: 0xb89600, surf: 0xfff4a8,
    note: "Le citron qui réveille.",
    desc: "Boisson gazeuse rafraîchissante au citron, au goût franc. À servir frais.",
    ingr: null,
  },
  {
    slug: "cola", name: "Cola", en: "Cola", cat: "cola",
    c: "#3B1E12", ink: "#FFFFFF", hi: "#E0A27A", rgb: "150,70,30",
    liq: 0x5a2410, atten: 0x1a0703, surf: 0x7a3418, dark: true,
    note: "Le classique, version Dada.",
    desc: "Le cola de Dada Drinks : gazeux, rafraîchissant, au goût unique. À servir frais.",
    ingr: null,
  },
  {
    slug: "cola-zero", name: "Cola Zero", en: "Zero Sugar", cat: "cola",
    c: "#161616", ink: "#FFFFFF", hi: "#E5E5E5", rgb: "150,150,150",
    liq: 0x4e1f0e, atten: 0x150602, surf: 0x6e2e15, dark: true,
    note: "Tout le goût, zéro sucre.",
    desc: "Le cola sans sucre de Dada Drinks : zéro sucre, zéro calorie, tout le pétillant. À servir frais.",
    ingr: null,
  },
  {
    slug: "ice-tea-peche", name: "Ice Tea Pêche", en: "Peach Iced Tea", cat: "the",
    c: "#E89A3C", ink: "#2A1600", hi: "#F4B266", rgb: "220,130,40",
    liq: 0xd9822b, atten: 0x6e3208, surf: 0xe8973e,
    note: "Thé glacé, saveur pêche.",
    desc: "Thé glacé à la pêche, rafraîchissant et parfumé. À boire bien frais.",
    ingr: "Eau, sucre, jus de pêche concentré (1,0 %), extrait de thé noir, acide citrique.",
  },
];

export const CAT_LABELS: Record<FlavorCategory, string> = {
  fruit: "Fruitée",
  cola: "Cola",
  the: "Thé glacé",
};

export const PACK_PRICE_CENTS = 3200;
/** 3200 → "32,00 €" (format identique côté serveur et navigateur) */
export const formatEUR = (cents: number) =>
  `${(cents / 100).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f")} €`;
export const PACK_PRICE = formatEUR(PACK_PRICE_CENTS);

/** Formats proposés aux particuliers, au même prix à la canette que le pack de 24 (32 € / 24) */
export const PACK_SIZES = [6, 12, 24, 32] as const;
export const DEFAULT_PACK = 24;
export const packCents = (size: number) => Math.round((PACK_PRICE_CENTS * size) / 24);
/** Prix d'appel : le plus petit pack */
export const FROM_PRICE = formatEUR(packCents(PACK_SIZES[0]));
export const PACK_RANGE = `${PACK_SIZES[0]} à ${PACK_SIZES[PACK_SIZES.length - 1]} canettes`;

export const getFlavor = (slug: string) => FLAVORS.find((f) => f.slug === slug);
export const flavorHref = (slug: string) => `/saveurs/${slug}`;

/** Dégradé métallique appliqué par-dessus la couleur de la canette */
export function canBg(c: string): string {
  return (
    "linear-gradient(90deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,.06) 11%, rgba(255,255,255,.38) 21%, " +
    "rgba(255,255,255,0) 33%, rgba(0,0,0,0) 64%, rgba(0,0,0,.46) 100%), " +
    c
  );
}

/** Mélange une couleur hex avec du blanc (t = 0 → couleur, t = 1 → blanc) */
export function mix(hex: string, t: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const m = (v: number) => Math.round(v + (255 - v) * t);
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}

export const pad = (i: number) => String(i + 1).padStart(2, "0");
