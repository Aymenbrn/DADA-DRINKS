import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import { SOCIALS, WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site";

export default function Footer() {
  return (
    <footer style={{ background: "var(--ink)", padding: "100px 0 32px", overflow: "hidden" }}>
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: 64 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 48, justifyContent: "space-between" }}>
          <NewsletterForm />
          <div className="footer-cols">
            <nav aria-label="Boutique" className="footer-links">
              <span className="eyebrow" style={{ fontSize: 12, color: "var(--muted-on-dark)" }}>BOUTIQUE</span>
              <Link href="/boutique">Particuliers</Link>
              <Link href="/professionnels">Professionnels</Link>
              <Link href="/professionnels#devis">Demande de devis</Link>
              <Link href="/panier">Panier</Link>
            </nav>
            <nav aria-label="La marque" className="footer-links">
              <span className="eyebrow" style={{ fontSize: 12, color: "var(--muted-on-dark)" }}>LA MARQUE</span>
              <Link href="/notre-histoire">Notre histoire</Link>
              <Link href="/collaborations">Collaborations</Link>
              <Link href="/actualites">Actualités</Link>
              <Link href="/contact">Contact</Link>
            </nav>
            <nav aria-label="Réseaux sociaux" className="footer-links">
              <span className="eyebrow" style={{ fontSize: 12, color: "var(--muted-on-dark)" }}>SUIVRE</span>
              {SOCIALS.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
              ))}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp · {WHATSAPP_DISPLAY}</a>
            </nav>
          </div>
        </div>
        <div
          aria-hidden="true"
          style={{
            fontFamily: "var(--display)", fontSize: "clamp(110px, 21vw, 300px)", lineHeight: 0.8, letterSpacing: "0.01em",
            color: "transparent", WebkitTextStroke: "2px rgba(244,242,238,0.35)", textAlign: "center", whiteSpace: "nowrap",
          }}
        >
          DADA DRINKS
        </div>
        <div
          style={{
            display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.14)", fontSize: 13, color: "var(--muted-on-dark)",
          }}
        >
          <span>
            Pour votre santé, mangez au moins cinq fruits et légumes par jour —{" "}
            <a href="https://www.mangerbouger.fr" target="_blank" rel="noopener noreferrer" style={{ color: "#D4D4D8" }}>mangerbouger.fr</a>
          </span>
          <span className="footer-legal">
            © {new Date().getFullYear()} Dada Drinks ·{" "}
            <Link href="/mentions-legales">Mentions légales</Link> ·{" "}
            <Link href="/cgv">CGV</Link> ·{" "}
            <Link href="/confidentialite">Confidentialité</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
