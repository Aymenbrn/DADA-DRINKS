const RETAILERS = ["Franprix", "E.Leclerc", "Maximarket"];

export default function Pros() {
  return (
    <section id="pros" style={{ background: "var(--accent)", color: "var(--ink)", padding: "120px 0" }}>
      <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: 56, alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ flex: "1 1 520px", display: "flex", flexDirection: "column", gap: 24 }}>
          <p className="eyebrow">PROFESSIONNELS · B TO B</p>
          <h2 className="h-xl" style={{ fontSize: "clamp(52px, 7vw, 108px)", fontWeight: 900, lineHeight: 0.9 }}>
            Vous êtes pro<span className="serif-i"> ?</span>
          </h2>
          <p style={{ margin: 0, maxWidth: 520, fontSize: 19, lineHeight: 1.5 }}>
            Restaurants, snacks, épiceries, distributeurs : commandez en volume avec des tarifs dédiés et un interlocuteur direct.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <a href="/professionnels#devis" className="btn btn-dark">Demander un devis pro</a>
            <a href="https://wa.me/33782206131" className="btn btn-outline-dark" target="_blank" rel="noopener noreferrer">Écrire sur WhatsApp</a>
          </div>
        </div>
        <div style={{ flex: "0 1 420px", display: "flex", flexDirection: "column", gap: 14 }}>
          <p className="eyebrow" style={{ fontSize: 12 }}>DÉJÀ EN RAYON CHEZ</p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "2px solid var(--ink)" }}>
            {RETAILERS.map((r, i) => (
              <li
                key={r}
                className={i === 2 ? "serif-i" : undefined}
                style={{ fontSize: i === 2 ? 44 : 40, fontWeight: i === 2 ? 400 : 800, letterSpacing: i === 2 ? undefined : "-0.03em", padding: "10px 0", borderBottom: "2px solid var(--ink)" }}
              >
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
