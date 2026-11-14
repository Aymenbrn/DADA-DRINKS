/**
 * Décor d'ambiance derrière la photo d'une vitrine (fiche pro) : coin d'épicerie,
 * mur chaud, étagères de canettes, comptoir, carrelage en perspective, lumière douce.
 * Volontairement flou et sourd pour que la vitrine reste au premier plan.
 */
const CANS = ["#D7192D", "#FFB547", "#4ADE80", "#F7A8CB", "#892D73", "#F2C418", "#E89A3C", "#3E2A1E"];

export default function ProScene() {
  const tiles = [];
  // carrelage en perspective : lignes de fuite vers un point au centre
  for (let k = -10; k <= 10; k++) {
    tiles.push(<line key={`v${k}`} x1={200 + k * 9} y1={212} x2={200 + k * 60} y2={300} stroke="#c9c2b6" strokeWidth="1" />);
  }
  [218, 227, 239, 254, 273, 297].forEach((y, i) => tiles.push(<line key={`h${i}`} x1={0} y1={y} x2={400} y2={y} stroke="#c9c2b6" strokeWidth="1" />));
  const shelf = (y: number, seed: number) =>
    Array.from({ length: 9 }, (_, i) => (
      <rect key={`${y}-${i}`} x={268 + i * 13} y={y - 18} width={9} height={18} rx={2} fill={CANS[(i + seed) % CANS.length]} />
    ));
  return (
    <svg className="pro-scene" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="psWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe4d2" />
          <stop offset="1" stopColor="#e2d3bc" />
        </linearGradient>
        <linearGradient id="psFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9e4db" />
          <stop offset="1" stopColor="#f6f3ee" />
        </linearGradient>
        <radialGradient id="psLight" cx="50%" cy="10%" r="70%">
          <stop offset="0" stopColor="#fff6dc" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff6dc" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="psShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#000" stopOpacity="0.35" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* mur */}
      <rect width="400" height="212" fill="url(#psWall)" />
      <rect y="200" width="400" height="12" fill="#d6c6ad" />
      {/* étagères murales avec canettes, à droite */}
      <g opacity="0.85">
        {[70, 110, 150].map((y, i) => (
          <g key={y}>
            {shelf(y, i * 3)}
            <rect x={262} y={y} width={126} height={5} fill="#a07b55" />
          </g>
        ))}
      </g>
      {/* comptoir à gauche, avec une plante */}
      <g opacity="0.9">
        <rect x={0} y={150} width={120} height={62} fill="#b88a5c" />
        <rect x={0} y={144} width={128} height={8} rx={2} fill="#8a6440" />
        <rect x={34} y={120} width={22} height={24} rx={3} fill="#3a3a40" />
        <rect x={30} y={116} width={30} height={6} rx={2} fill="#5a5a62" />
        <path d="M92 144 q-4 -14 4 -22 q8 8 4 22 Z" fill="#c9773a" />
        <path d="M96 124 q-18 -16 -10 -38 q14 14 10 38 Z M98 122 q4 -26 22 -30 q-2 22 -22 30 Z M97 126 q-22 -4 -28 -22 q22 0 28 22 Z" fill="#3f7f3a" />
      </g>
      {/* lampe suspendue et halo */}
      <rect width="400" height="300" fill="url(#psLight)" />
      <line x1="200" y1="0" x2="200" y2="18" stroke="#2a2a2a" strokeWidth="1.5" />
      <path d="M186 30 q14 -16 28 0 Z" fill="#2a2a2a" />
      {/* sol carrelé */}
      <rect y="212" width="400" height="88" fill="url(#psFloor)" />
      <g opacity="0.7">{tiles}</g>
      {/* ombre au pied de la vitrine */}
      <ellipse cx="200" cy="288" rx="70" ry="10" fill="url(#psShadow)" />
    </svg>
  );
}
