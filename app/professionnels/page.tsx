import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import AudienceSwitch from "@/components/AudienceSwitch";
import { ProReasons, ProTrust, ProQuote } from "@/components/ProDetails";
import { PRO_PRODUCTS } from "@/lib/pro";
import { formatEUR } from "@/lib/flavors";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site";
import ProScene from "@/components/ProScene";
import Pallet3D from "@/components/Pallet3D";

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
                <div className={`pro-visual${p.image || !p.size ? " has-photo" : ""}${p.size ? ` is-${p.size}` : " is-pallet"}`} aria-hidden="true">
                  {p.image ? (
                    <>
                      <ProScene width={p.size === "slim" ? 64 : p.size === "moyen" ? 84 : 132} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" className="pro-photo" loading="lazy" />
                    </>
                  ) : (
                  <>
                  {p.size ? (
                    <span className="fridge"><span className="fridge-logo">DADA</span><span className="fridge-shelves" /></span>
                  ) : (
                    <>
                      <ProScene width={150} />
                      <Pallet3D />
                    </>
                  )}
                </>
                  )}
                </div>
                <div className="pro-body">
                  <h3>{p.name}</h3>
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
