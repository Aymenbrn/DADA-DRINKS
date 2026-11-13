import type { CSSProperties, ReactNode } from "react";

/**
 * Décor de l'accueil, redessiné d'après la planche « feuillages tropicaux + dune de sable » :
 * feuilles de monstera et palmes dans les coins hauts (elles se balancent doucement),
 * dune de sable fixe en bas.
 * Le fond lui-même reste celui de la section, aux couleurs de la canette du centre.
 */

// Petit générateur pseudo-aléatoire (rendu identique côté serveur et navigateur)
function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Feuille de monstera, tige en (0,0), pointe vers le haut (y négatif), ~100 de long */
function Monstera({ fill, rib, id }: { fill: string; rib: string; id: string }) {
  const outline = "M0,0 C-58,-6 -66,-74 -12,-102 C-4,-106 4,-106 12,-102 C66,-74 58,-6 0,0 Z";
  const cuts: ReactNode[] = [];
  for (let k = 0; k < 5; k++) {
    const y = -18 - k * 16;
    const w = 6 - k * 0.6;
    cuts.push(<path key={`l${k}`} d={`M-70,${y - 10} L-10,${y + 4}`} stroke="#000" strokeWidth={w} strokeLinecap="round" />);
    cuts.push(<path key={`r${k}`} d={`M70,${y - 14} L10,${y + 2}`} stroke="#000" strokeWidth={w} strokeLinecap="round" />);
  }
  return (
    <g>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="-80" y="-120" width="160" height="130">
          <path d={outline} fill="#fff" />
          {cuts}
          <ellipse cx="-14" cy="-40" rx="3.2" ry="6" fill="#000" transform="rotate(-25 -14 -40)" />
          <ellipse cx="15" cy="-58" rx="3" ry="5.5" fill="#000" transform="rotate(25 15 -58)" />
          <ellipse cx="-12" cy="-72" rx="2.6" ry="4.6" fill="#000" transform="rotate(-25 -12 -72)" />
        </mask>
      </defs>
      <g mask={`url(#${id})`}>
        <path d={outline} fill={fill} />
        <path d="M0,4 C2,-30 1,-70 0,-100" stroke={rib} strokeWidth="2.4" fill="none" opacity="0.8" />
      </g>
      <path d="M0,0 L0,26" stroke={fill} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

/** Palme : nervure courbe et folioles fines, ~130 de long */
function Palm({ fill, seed, bend = 18 }: { fill: string; seed: number; bend?: number }) {
  const r = rng(seed);
  const leaflets: ReactNode[] = [];
  const N = 22;
  for (let i = 1; i <= N; i++) {
    const t = i / (N + 1);
    // point sur la nervure (courbe quadratique)
    const x = 2 * (1 - t) * t * bend + t * t * bend * 0.6;
    const y = -t * 130;
    const len = 46 * Math.sin(Math.PI * (0.15 + t * 0.8)) + 6;
    for (const side of [-1, 1]) {
      const a = (side * (62 - t * 25) - 8 + (r() - 0.5) * 8) * (Math.PI / 180);
      const ex = x + Math.sin(a) * len, ey = y - Math.cos(a) * len;
      const mx = (x + ex) / 2, my = (y + ey) / 2;
      const nx = -(ey - y) / len * 3.2, ny = (ex - x) / len * 3.2;
      leaflets.push(
        <path key={`${i}${side}`} d={`M${x},${y} Q${mx + nx},${my + ny} ${ex},${ey} Q${mx - nx},${my - ny} ${x},${y} Z`} fill={fill} />
      );
    }
  }
  return (
    <g>
      {leaflets}
      <path d={`M0,22 Q${bend},-65 ${bend * 0.6},-130`} stroke={fill} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  );
}

type LeafSpec = { kind: "m" | "p"; x: number; y: number; rot: number; s: number; fill: string; rib?: string; seed?: number; dur: number; delay: number };

// Bouquet du coin haut gauche (le coin droit est le même, retourné et un peu varié)
const LEFT: LeafSpec[] = [
  { kind: "p", x: 150, y: -30, rot: 150, s: 1.5, fill: "#9ccc3a", seed: 3, dur: 7.5, delay: -1 },
  { kind: "p", x: 40, y: 10, rot: 118, s: 1.4, fill: "#6db33f", seed: 5, dur: 8.5, delay: -3 },
  { kind: "m", x: 120, y: -10, rot: 160, s: 1.25, fill: "#137a3f", rib: "#3fa35c", dur: 9, delay: -2 },
  { kind: "p", x: -20, y: 120, rot: 95, s: 1.3, fill: "#a8d13f", seed: 7, dur: 7, delay: -4 },
  { kind: "m", x: -10, y: 210, rot: 75, s: 1.35, fill: "#0f6b38", rib: "#2f8f50", dur: 10, delay: -5 },
  { kind: "m", x: 30, y: 60, rot: 128, s: 1.05, fill: "#1a8a47", rib: "#4cb36a", dur: 8, delay: -6 },
];
const RIGHT: LeafSpec[] = [
  { kind: "p", x: 330, y: -20, rot: -160, s: 1.6, fill: "#7fbf3f", seed: 11, dur: 8, delay: -2 },
  { kind: "m", x: 260, y: 30, rot: -150, s: 1.3, fill: "#0e6a37", rib: "#2f8f50", dur: 9.5, delay: -1 },
  { kind: "p", x: 420, y: 80, rot: -110, s: 1.7, fill: "#0b5a2e", seed: 13, dur: 7.2, delay: -4 },
  { kind: "m", x: 360, y: 90, rot: -120, s: 1.2, fill: "#157a40", rib: "#45aa64", dur: 8.6, delay: -3 },
  { kind: "p", x: 420, y: 200, rot: -80, s: 1.6, fill: "#0d4f29", seed: 17, dur: 9, delay: -5 },
  { kind: "p", x: 200, y: -40, rot: 175, s: 1.3, fill: "#a8d13f", seed: 19, dur: 7.8, delay: -6 },
];

function Leaves({ specs, prefix }: { specs: LeafSpec[]; prefix: string }) {
  return (
    <>
      {specs.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.s})`}>
          <g className="beach-leaf" style={{ "--dur": `${l.dur}s`, "--delay": `${l.delay}s` } as CSSProperties}>
            {l.kind === "m" ? (
              <Monstera fill={l.fill} rib={l.rib ?? l.fill} id={`${prefix}-m${i}`} />
            ) : (
              <Palm fill={l.fill} seed={l.seed ?? i} />
            )}
          </g>
        </g>
      ))}
    </>
  );
}

export default function BeachDecor() {
  return (
    <div className="beach" aria-hidden="true">
      <svg className="beach-corner is-left" viewBox="0 0 420 320" preserveAspectRatio="xMinYMin meet">
        <Leaves specs={LEFT} prefix="l" />
      </svg>
      <svg className="beach-corner is-right" viewBox="0 0 420 320" preserveAspectRatio="xMaxYMin meet">
        <Leaves specs={RIGHT} prefix="r" />
      </svg>

      <svg className="beach-sand" viewBox="0 0 1000 170" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sandTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e6c896" />
            <stop offset="0.55" stopColor="#ecd3a6" />
            <stop offset="1" stopColor="#f3e2c2" />
          </linearGradient>
          <linearGradient id="sandBack" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#d9b47a" />
            <stop offset="0.45" stopColor="#ddb985" />
            <stop offset="1" stopColor="#e2c493" />
          </linearGradient>
        </defs>
        {/* dune du fond, puis le premier plan */}
        <path d="M0,150 C140,120 300,70 420,40 C470,28 540,26 600,34 C690,46 760,62 1000,60 L1000,170 L0,170 Z" fill="url(#sandBack)" />
        <path d="M0,160 C180,140 330,100 430,78 C520,60 640,70 760,84 C860,95 940,92 1000,90 L1000,170 L0,170 Z" fill="url(#sandTop)" />
        <path d="M0,170 C120,150 220,140 300,150 C380,160 420,170 420,170 Z" fill="#efdcb6" opacity="0.7" />
        {Array.from({ length: 70 }, (_, i) => {
          const r = rng(i + 100);
          const x = r() * 1000, y = 95 + r() * 70;
          return <circle key={i} cx={x} cy={y} r={0.9 + r() * 1.1} fill="#c9a46c" opacity={0.35 + r() * 0.3} />;
        })}
      </svg>

    </div>
  );
}
