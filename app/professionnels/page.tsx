import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import AudienceSwitch from "@/components/AudienceSwitch";
import { ProReasons, ProTrust, ProQuote } from "@/components/ProDetails";
import { PRO_PRODUCTS } from "@/lib/pro";
import { formatEUR } from "@/lib/flavors";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site";
import Pro3D from "@/components/Pro3D";

export const metadata: Metadata = {
  title: "Professionnels",
  description:
    "Restaurants, épiceries, grande distribution : palettes mixtes, vitrines réfrigérées Dada et tarifs dédiés. Demandez votre devis.",
};

export default function ProfessionnelsPage() {
  return (
    <main>
      <PageHero
        eyebrow="PROFESSIONNELS · B TO B"
        title="Mettez du Dada"
        accent="dans vos rayons."
        lede="Restaurants, snacks, épiceries, grossistes et grande distribution : commandez en volume, équipez-vous d’une vitrine et profitez de tarifs dédiés."
      >
        <AudienceSwitch value="pro" className="pro-switch" />
        <div className="hero-actions">
          <a href="#devis" className="btn btn-accent">Demander un devis</a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">WhatsApp · {WHATSAPP_DISPLAY}</a>
        </div>
      </PageHero>

      <ProReasons />

      <section className="section page-light" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow" style={{ color: "var(--muted-on-light)" }}>L’OFFRE PRO</p>
            <h2 className="h-xl section-title">Palettes<span className="serif-i"> et vitrines.</span></h2>
          </div>
          <ul className="pro-grid">
            {PRO_PRODUCTS.map((p) => (
              <li key={p.slug} className="pro-card">
                <Link href={`/professionnels/${p.slug}`} className="pro-card-link" aria-label={`Voir la fiche ${p.name}`}>
<div className="pro-visual has-3d" aria-hidden="true">
                  <Pro3D kind={p.size ?? "pallet"} fallback={p.image ?? "/pro/palette.webp"} />
                </div>
</Link>
                <div className="pro-body">
                  <h3><Link href={`/professionnels/${p.slug}`}>{p.name}</Link></h3>
                  <p>{p.desc}</p>
                  {p.freeCases && <p className="pro-gift">+ {p.freeCases} colis offerts</p>}
                  {p.size ? (
                    <div className="pro-buy">
                      <p className="pro-price">{formatEUR(p.priceCents)}</p>
                      <a href="#devis" className="pro-add" aria-label={`Demander un devis pour la ${p.name}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                      </a>
                    </div>
                  ) : (
                    <>
                      <p className="pro-price">{p.from && <small>à partir de </small>}{formatEUR(p.priceCents)}</p>
                      <a href="#devis" className="btn btn-dark pro-cta">Demander un devis</a>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="fine-print">Tarifs repris du site actuel, hors frais de livraison. Conditions détaillées sur devis.</p>
        </div>
      </section>

      <ProTrust />

      <ProQuote />
    </main>
  );
}
