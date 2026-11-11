import type { CSSProperties } from "react";
import { canBg } from "./flavors";

/** Une pièce du collage : [texte, déclarations CSS] */
export type Piece = [string, string];

export type Chapter = {
  kicker: string;
  big: string;
  year: string;
  tab: string;
  title: string;
  body: string;
  bg: string;
  ink: string;
  muted: string;
  poem?: boolean;
  pieces: Piece[];
};

const D = "font-family:var(--display)";
const S = "font-family:var(--serif);font-style:italic";
const M = "font-family:var(--mono)";
const I = "font-family:var(--sans)";

const canPiece = (c: string, ink: string, pos: string, rot: number): Piece => [
  "DADA",
  `${pos};width:118px;height:228px;border-radius:14px / 20px;background:${canBg(c)};writing-mode:vertical-rl;display:flex;align-items:center;justify-content:center;${D};font-size:72px;color:${ink};transform:rotate(${rot}deg);box-shadow:0 30px 40px -10px rgba(0,0,0,.6)`,
];

export const CHAPTERS: Chapter[] = [
  {
    kicker: "ACTE 01",
    big: "ZURICH, 1916",
    year: "1916",
    tab: "Zurich",
    title: "Tout commence dans un cabaret.",
    body: "En pleine guerre, des artistes réfugiés ouvrent le Cabaret Voltaire. Sur scène : poèmes sans mots, masques, costumes en carton, vacarme. Leur idée : si le monde a perdu la raison, l’art aussi peut la perdre.",
    bg: "#E9E1CF",
    ink: "#0A0A0A",
    muted: "#52525B",
    pieces: [
      ["", "left:6%;top:10%;width:64%;height:50%;background:#0A0A0A;transform:rotate(-3deg)"],
      ["CABARET", `left:10%;top:17%;${D};font-size:84px;color:#F4F2EE;transform:rotate(-3deg)`],
      ["voltaire", `left:20%;top:32%;${S};font-size:100px;color:#FF5A1F;transform:rotate(3deg)`],
      ["1916", `right:7%;top:6%;width:150px;height:150px;border-radius:50%;background:#FF5A1F;color:#0A0A0A;display:flex;align-items:center;justify-content:center;${D};font-size:52px;transform:rotate(10deg)`],
      ["SPIEGELGASSE 1 · ZURICH", `left:34%;top:66%;padding:10px 14px;background:#F4F2EE;border:2px solid #0A0A0A;${M};font-size:13px;letter-spacing:.14em;color:#0A0A0A;transform:rotate(-5deg)`],
      ["", "right:6%;bottom:7%;width:160px;height:120px;background-image:radial-gradient(#0A0A0A 1.4px,transparent 1.8px);background-size:10px 10px;transform:rotate(4deg)"],
      ["« gadji beri bimba »", `left:7%;bottom:9%;${S};font-size:42px;color:#0A0A0A;transform:rotate(-2deg)`],
    ],
  },
  {
    kicker: "ACTE 02",
    big: "UN MOT AU HASARD",
    year: "Le nom",
    tab: "Au hasard",
    title: "Dada ne veut rien dire. C’est tout l’intérêt.",
    body: "Selon la légende, le nom est trouvé en glissant un coupe-papier au hasard dans un dictionnaire. « Dada » : le cheval de bois des enfants. Un mot absurde pour un mouvement qui refuse toutes les cases.",
    bg: "#F4F2EE",
    ink: "#0A0A0A",
    muted: "#52525B",
    pieces: [
      ["DADA", `right:-3%;bottom:2%;${D};font-size:210px;color:transparent;-webkit-text-stroke:2px #0A0A0A;transform:rotate(-6deg)`],
      ["dada  n. m.\n1. Cheval, dans le langage des enfants.\n2. Idée fixe, marotte.", `left:8%;top:13%;max-width:60%;white-space:pre-line;line-height:1.35;background:#FFFFFF;color:#0A0A0A;padding:26px 28px;border:2px solid #0A0A0A;box-shadow:10px 10px 0 #0A0A0A;font-family:var(--serif);font-size:28px;transform:rotate(-2deg)`],
      ["", "left:62%;top:14%;width:6px;height:210px;border-radius:3px;background:#0A0A0A;transform:rotate(26deg)"],
      ["↓ ICI, AU HASARD", `left:54%;top:7%;padding:8px 12px;background:var(--accent);color:#0A0A0A;${M};font-weight:700;font-size:13px;letter-spacing:.12em;transform:rotate(6deg)`],
      ["cheval de bois", `left:7%;bottom:12%;${S};font-size:56px;color:#0A0A0A;transform:rotate(3deg)`],
    ],
  },
  {
    kicker: "ACTE 03",
    big: "CASSER LES CODES",
    year: "1917",
    tab: "Casser les codes",
    title: "Un urinoir au musée ? Pourquoi pas.",
    body: "Collages, poèmes découpés, objets détournés : de Zurich à Paris et New York, Dada fait exploser le bon goût. En 1917, Marcel Duchamp présente un urinoir signé « R. Mutt ». L’art devient une attitude.",
    bg: "#E6FF3A",
    ink: "#0A0A0A",
    muted: "#3F3F46",
    pieces: [
      ["C", `left:4%;top:10%;padding:0 14px;background:#0A0A0A;color:#E6FF3A;${D};font-size:124px;transform:rotate(-6deg)`],
      ["a", `left:22%;top:14%;padding:0 16px 8px;background:#F4F2EE;color:#0A0A0A;${S};font-size:132px;transform:rotate(5deg)`],
      ["S", `left:39%;top:9%;padding:0 12px;border:3px solid #0A0A0A;color:#0A0A0A;${I};font-weight:900;font-size:116px;transform:rotate(-2deg)`],
      ["S", `left:56%;top:15%;padding:0 10px;background:#FF5A1F;color:#0A0A0A;${M};font-weight:700;font-size:112px;transform:rotate(8deg)`],
      ["E", `left:74%;top:10%;padding:0 12px;background:#FFFFFF;color:#0A0A0A;${D};font-size:124px;transform:rotate(-4deg)`],
      ["les règles", `left:16%;top:50%;${S};font-size:84px;color:#0A0A0A;text-decoration:line-through;text-decoration-thickness:7px`],
      ["NON.", `left:7%;bottom:8%;padding:6px 16px;background:#0A0A0A;color:#F4F2EE;${D};font-size:68px;transform:rotate(3deg)`],
      ["R. MUTT 1917", `right:7%;bottom:10%;padding:10px 14px;border:3px solid #0A0A0A;color:#0A0A0A;${M};font-weight:700;font-size:22px;transform:rotate(-9deg)`],
    ],
  },
  {
    kicker: "ACTE 04",
    big: "NANTERRE, 92",
    year: "Nanterre",
    tab: "Le 92",
    title: "Un siècle plus tard, l’esprit renaît en banlieue.",
    body: "Rien ne prédestinait son fondateur à lancer une marque de soda. Mais à Nanterre, on apprend la résilience. Face à un rayon où toutes les canettes se ressemblent, il choisit le parti de Dada : l’audace.",
    bg: "#0A0A0A",
    ink: "#F4F2EE",
    muted: "#A1A1AA",
    pieces: [
      ["92", `right:-4%;top:-8%;${D};font-size:380px;color:transparent;-webkit-text-stroke:2px rgba(244,242,238,.3)`],
      ["NANTERRE", `left:6%;top:24%;${D};font-size:96px;color:#F4F2EE;transform:rotate(-3deg)`],
      ["", "left:6%;right:6%;top:50%;height:6px;border-radius:3px;background:#FF5A1F"],
      ["RER A", `left:6%;top:42%;padding:4px 8px;background:#FF5A1F;color:#0A0A0A;${M};font-weight:700;font-size:12px`],
      ["● La Défense", `left:6%;top:53%;${M};font-size:12px;color:#F4F2EE`],
      ["● Nanterre-Préfecture", `left:35%;top:53%;${M};font-size:12px;color:#F4F2EE`],
      ["● Nanterre-Université", `left:66%;top:53%;${M};font-size:12px;color:#F4F2EE`],
      ["« Ma famille m’a donné du cran. »\n— Mohamed Ghobni, fondateur", `left:7%;bottom:8%;max-width:68%;white-space:pre-line;line-height:1.3;padding:22px 26px;background:#F4F2EE;color:#0A0A0A;${S};font-size:28px;box-shadow:8px 8px 0 #FF5A1F;transform:rotate(2deg)`],
      ["MADE\nIN 92", `right:7%;bottom:9%;width:110px;height:110px;border-radius:50%;border:2px dashed #F4F2EE;display:flex;align-items:center;justify-content:center;text-align:center;white-space:pre-line;${M};font-weight:700;font-size:15px;color:#F4F2EE;transform:rotate(-12deg)`],
    ],
  },
  {
    kicker: "ACTE 05",
    big: "LA CANETTE MANIFESTE",
    year: "13 saveurs",
    tab: "La canette",
    title: "Treize saveurs. Zéro règle.",
    body: "Cerise, mangue, lychee, mojito, cola… Chaque canette est un petit collage. Audace, courage, détermination : l’esprit de 1916, servi bien frais. Jusque dans les clips de Ninho et de Jul, et dans la cage du PFL.",
    bg: "#15161A",
    ink: "#F4F2EE",
    muted: "#A1A1AA",
    pieces: [
      ["zéro règle", `right:6%;top:6%;${S};font-size:52px;color:#FF5A1F;transform:rotate(8deg)`],
      canPiece("#D7192D", "#FFFFFF", "left:18%;top:17%", 168),
      canPiece("#2BCB6E", "#04230F", "left:58%;top:17%", 192),
      canPiece("#FF9F1C", "#1A0F00", "left:38%;top:11%", 180),
      ["13 SAVEURS", `left:6%;bottom:15%;${D};font-size:96px;color:#F4F2EE`],
      ["AUDACE · COURAGE · DÉTERMINATION", `left:7%;bottom:6%;padding:8px 12px;background:#F4F2EE;color:#0A0A0A;${M};font-weight:700;font-size:13px;letter-spacing:.08em;transform:rotate(-3deg)`],
    ],
  },
  {
    kicker: "ACTE 06",
    big: "À TOI DE JOUER",
    year: "À toi",
    tab: "Ton poème",
    title: "Fais ton poème Dada.",
    body: "En 1920, Tristan Tzara donne sa recette : découper un article, mettre les mots dans un sac, secouer, recopier dans l’ordre de sortie. On a mis nos mots dans le sac. À toi de secouer.",
    bg: "var(--accent)",
    ink: "#0A0A0A",
    muted: "#1F1F1F",
    poem: true,
    pieces: [],
  },
];

export const POEM_WORDS = [
  "pétille", "cerise", "Nanterre", "révolte", "bulles", "hasard", "zéro règle", "mangue",
  "cri", "Zurich", "glacée", "insolente", "lychee", "cheval de bois", "audace", "canette",
  "manifeste", "boum", "sucre", "mojito", "dada", "fraîcheur", "vacarme", "pourquoi pas",
];

const CHIP_LOOKS = [
  "background:#0A0A0A;color:#F4F2EE;font-family:var(--display)",
  "background:#F4F2EE;color:#0A0A0A;font-family:var(--serif);font-style:italic",
  "background:transparent;color:#0A0A0A;border:3px solid #0A0A0A;font-family:var(--sans);font-weight:900",
  "background:#FFFFFF;color:#0A0A0A;font-family:var(--mono);font-weight:700;box-shadow:5px 5px 0 #0A0A0A",
];
const CHIP_SIZES = [30, 38, 46, 56];

/** Générateur pseudo-aléatoire déterministe (même rendu serveur / client) */
export function rng(seed: number) {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** La méthode Tzara : on secoue le sac et on tire 9 mots */
export function makePoem(seed: number): Piece[] {
  const rand = rng(seed);
  const bag = POEM_WORDS.slice();
  const out: Piece[] = [];
  for (let k = 0; k < 9; k++) {
    const w = bag.splice(Math.floor(rand() * bag.length), 1)[0];
    const look = CHIP_LOOKS[Math.floor(rand() * CHIP_LOOKS.length)];
    const size = CHIP_SIZES[Math.floor(rand() * CHIP_SIZES.length)];
    const rot = Math.round(rand() * 18) - 9;
    out.push([w, `${look};padding:6px 14px;font-size:${size}px;transform:rotate(${rot}deg)`]);
  }
  return out;
}

/** Convertit "left:10%;font-size:20px" en objet de style React */
export function css(decls: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const d of decls.split(";")) {
    const i = d.indexOf(":");
    if (i < 0) continue;
    const prop = d.slice(0, i).trim();
    const value = d.slice(i + 1).trim();
    if (!prop) continue;
    const camel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    let key: string;
    if (prop.startsWith("-webkit-")) {
      const c = camel(prop.slice(8));
      key = "Webkit" + c.charAt(0).toUpperCase() + c.slice(1);
    } else {
      key = camel(prop);
    }
    out[key] = value;
  }
  return out as CSSProperties;
}
