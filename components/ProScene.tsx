/**
 * Mise en situation de la vitrine : le mur d'un commerce (peinture, soubassement en carreaux
 * métro, sol béton ciré), une étagère de canettes et une ardoise, un spot au-dessus de la vitrine.
 * La photo de la vitrine se pose devant, contre le mur ; le décor reste discret et un peu flou.
 */
const CANS = ["#D7192D", "#FFB547", "#4ADE80", "#F7A8CB", "#892D73", "#F2C418", "#E89A3C", "#3E2A1E"];

/** width : largeur de la vitrine, en unités du dessin (400 de large), pour caler son ombre sur le mur */
export default function ProScene({ width = 70 }: { width?: number }) {
  const shelf = (x: number, y: number, seed: number) =>
    Array.from({ length: 6 }, (_, i) => (
      <rect key={`${y}-${i}`} x={x + 4 + i * 11} y={y - 16} width={8} height={16} rx={1.6} fill={CANS[(i + seed) % CANS.length]} />
    ));
  return (
    <svg className="pro-scene" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="psPaint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ece6dc" />
          <stop offset="1" stopColor="#e3dbcd" />
        </linearGradient>
        <pattern id="psTiles" width="24" height="12" patternUnits="userSpaceOnUse">
          <rect width="24" height="12" fill="#f7f6f2" />
          <path d="M0 11.5H24M12 0V12" stroke="#d9d5cc" strokeWidth="1" />
          <path d="M0 5.5H24" stroke="#d9d5cc" strokeWidth="1" />
          <path d="M0 0V6M24 0V6" stroke="#d9d5cc" strokeWidth="1" />
        </pattern>
        <linearGradient id="psFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bdb7ad" />
          <stop offset="1" stopColor="#d9d4cb" />
        </linearGradient>
        <radialGradient id="psSpot" cx="50%" cy="0%" r="60%">
          <stop offset="0" stopColor="#fffaf0" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fffaf0" stopOpacity="0" />
        </radialGradient>
        <filter id="psSoft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      {/* mur peint et soubassement carrelé */}
      <rect width="400" height="262" fill="url(#psPaint)" />
      <rect y="168" width="400" height="94" fill="url(#psTiles)" />
      <rect y="164" width="400" height="5" fill="#cfc6b6" />
      <rect y="258" width="400" height="5" fill="#a9a196" />

      {/* spot au plafond qui éclaire la vitrine */}
      <rect width="400" height="262" fill="url(#psSpot)" />
      <rect x="188" y="0" width="24" height="6" rx="2" fill="#2b2b2b" />

      {/* ombre portée de la vitrine sur le mur */}
      <rect x={204 - width / 2} y="40" width={width} height="222" rx="6" fill="#000" opacity="0.22" filter="url(#psSoft)" />

      {/* à gauche : ardoise du commerce */}
      <g opacity="0.9">
        <rect x="58" y="62" width="74" height="84" rx="3" fill="#8a6a48" />
        <rect x="62" y="66" width="66" height="76" rx="2" fill="#2f3431" />
        {[80, 92, 104, 116, 128].map((y, i) => (
          <line key={y} x1="70" y1={y} x2={i % 2 ? 110 : 120} y2={y} stroke="#e7e7e2" strokeOpacity="0.65" strokeWidth="2" strokeLinecap="round" />
        ))}
      </g>

      {/* à droite : étagère murale de canettes */}
      <g opacity="0.9">
        {[96, 140].map((y, i) => (
          <g key={y}>
            {shelf(266, y, i * 3)}
            <rect x="264" y={y} width="74" height="4" rx="1" fill="#9a7650" />
            <path d={`M272 ${y + 4} v8 h3 v-8 Z M327 ${y + 4} v8 h3 v-8 Z`} fill="#555" />
          </g>
        ))}
      </g>

      {/* sol en béton ciré, avec reflet et ombre au pied de la vitrine */}
      <rect y="263" width="400" height="37" fill="url(#psFloor)" />
      <rect x="150" y="263" width="100" height="22" fill="#fff" opacity="0.12" />
      <ellipse cx="204" cy="286" rx={width * 0.8} ry="7" fill="#000" opacity="0.32" filter="url(#psSoft)" />
    </svg>
  );
}
