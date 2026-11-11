const COLLABS = [
  { title: "Ninho — Carolina", text: "Dada Drinks à l’image, dans le clip.", tag: "MUSIQUE", bg: "#0A0A0A", label: "[ VISUEL — EXTRAIT DU CLIP ]", light: true, rot: -3 },
  { title: "Jul — Canette dans les mains", text: "La canette Dada, en plein cadre.", tag: "MUSIQUE", bg: "var(--accent)", label: "[ VISUEL — EXTRAIT DU CLIP ]", light: false, rot: 2 },
  { title: "PFL Europe", text: "Partenaire des soirées MMA de Nantes et Lyon.", tag: "SPORT", bg: "#1F1F23", label: "[ VISUEL — CAGE PFL ]", light: true, rot: -2 },
];

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
              {/* Remplacer ce bloc par <video> ou <Image> avec les visuels officiels */}
              <div className="halftone" style={{ height: 340, backgroundColor: c.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.14em", color: c.light ? "#A1A1AA" : "#0A0A0A" }}>{c.label}</span>
                <span
                  className="tag"
                  style={{ top: 18, left: 18, background: c.light ? "var(--paper)" : "var(--ink)", color: c.light ? "var(--ink)" : "var(--paper)", transform: `rotate(${c.rot}deg)` }}
                >
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
