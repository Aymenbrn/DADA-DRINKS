import NewsVideo from "@/components/NewsVideo";

type CollabCard = { title: string; text: string; tag: string; rot: number; video?: { id: string; poster: string } };

const COLLABS: CollabCard[] = [
  { title: "Ninho — Carolina", text: "Dada Drinks à l’image, dans le clip.", tag: "MUSIQUE", rot: -3, video: { id: "JjqBlp6hLv4", poster: "/news/ninho-carolina.webp" } },
  { title: "Jul — Canette dans les mains", text: "La canette Dada, en plein cadre.", tag: "MUSIQUE", rot: 2, video: { id: "iFY615_FQOw", poster: "/news/jul-canette.webp" } },
  { title: "PFL Europe", text: "Partenaire des soirées MMA de Nantes et Lyon.", tag: "SPORT", rot: -2 },
];

/** Visuel PFL Europe : la cage octogonale sous les projecteurs (illustration, sans logo) */
function PflVisual() {
  const oct = (r: number) =>
    Array.from({ length: 8 }, (_, k) => {
      const a = Math.PI / 8 + (k * Math.PI) / 4;
      return `${200 + Math.cos(a) * r},${170 + Math.sin(a) * r * 0.42}`;
    }).join(" ");
  return (
    <div className="collab-pfl" aria-label="Illustration : la cage de la PFL Europe" role="img">
      <svg viewBox="0 0 400 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="pflSpot" cx="50%" cy="38%" r="65%">
            <stop offset="0" stopColor="#8a1420" />
            <stop offset="0.45" stopColor="#3a0a10" />
            <stop offset="1" stopColor="#0a0a0a" />
          </radialGradient>
          <linearGradient id="pflBeam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <pattern id="pflMesh" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <path d="M0 0H10M0 0V10" stroke="#fff" strokeOpacity="0.16" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="340" fill="url(#pflSpot)" />
        <polygon points="150,0 250,0 300,240 100,240" fill="url(#pflBeam)" />
        {/* tapis, grillage et poteaux de la cage */}
        <polygon points={oct(150)} fill="#1c1c22" stroke="#d4d4d8" strokeOpacity="0.5" strokeWidth="2" />
        <polygon points={oct(150)} fill="url(#pflMesh)" transform="translate(0,-58)" />
        <polygon points={oct(150)} fill="none" stroke="#e4e4e7" strokeOpacity="0.7" strokeWidth="3" transform="translate(0,-58)" />
        {Array.from({ length: 8 }, (_, k) => {
          const a = Math.PI / 8 + (k * Math.PI) / 4;
          const x = 200 + Math.cos(a) * 150, y = 170 + Math.sin(a) * 63;
          return <line key={k} x1={x} y1={y} x2={x} y2={y - 58} stroke="#f4f4f5" strokeOpacity="0.8" strokeWidth="4" />;
        })}
        <ellipse cx="200" cy="170" rx="70" ry="22" fill="#d7192d" fillOpacity="0.55" />
      </svg>
      <div className="collab-pfl-text">
        <strong>PFL EUROPE</strong>
        <span>NANTES · LYON — 2025</span>
      </div>
    </div>
  );
}

export default function Collabs() {
  return (
    <section id="collabs" style={{ background: "var(--paper)", color: "var(--ink)", padding: "130px 0" }}>
      <div className="container">
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p className="eyebrow" style={{ color: "var(--muted-on-light)" }}>COLLABS &amp; CULTURE</p>
            <h2 className="h-xl" style={{ fontSize: "clamp(44px, 5.4vw, 80px)", lineHeight: 0.95 }}>
              Ils ont tenu<span className="serif-i"> la canette.</span>
            </h2>
          </div>
          <a href="/collaborations" style={{ height: 48, display: "inline-flex", alignItems: "center", fontSize: 17, fontWeight: 600 }}>Toutes nos collaborations →</a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginTop: 56 }}>
          {COLLABS.map((c) => (
            <article key={c.title} className="card">
              <div className="collab-media">
                {c.video ? <NewsVideo id={c.video.id} poster={c.video.poster} title={c.title} /> : <PflVisual />}
                <span className="tag" style={{ top: 18, left: 18, zIndex: 3, background: "var(--paper)", color: "var(--ink)", transform: `rotate(${c.rot}deg)` }}>
                  {c.tag}
                </span>
              </div>
              <div style={{ padding: "22px 24px 26px", display: "flex", flexDirection: "column", gap: 6 }}>
                <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>{c.title}</h3>
                <p style={{ margin: 0, fontSize: 16, color: "var(--muted-on-light)" }}>{c.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
