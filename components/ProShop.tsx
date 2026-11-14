import Link from "next/link";
import { FLAVORS, PACK_PRICE, formatEUR } from "@/lib/flavors";
import { PRO_PRODUCTS } from "@/lib/pro";
import Pro3D from "@/components/Pro3D";

/** Accueil, côté « Pro » : packs de canettes, palette mixte et vitrines réfrigérées */
export default function ProShop() {
  return (
    <section id="offre-pro" className="section page-light home-pro">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow" style={{ color: "var(--muted-on-light)" }}>L’OFFRE PRO</p>
          <h2 className="h-xl section-title">
            Packs, palettes<span className="serif-i"> et frigos.</span>
          </h2>
          <p className="home-pro-lede">
            Restaurants, snacks, épiceries, grossistes : commandez en volume, équipez-vous d’une vitrine Dada et profitez de tarifs dédiés.
          </p>
        </div>

        <ul className="pro-grid">
          {/* Les packs de 24 canettes, toute la gamme */}
          <li className="pro-card">
            <div className="pro-visual is-packs" aria-hidden="true">
              <span className="pack-dots">
                {FLAVORS.map((f) => (
                  <span key={f.slug} style={{ background: f.c }} />
                ))}
              </span>
            </div>
            <div className="pro-body">
              <h3>Packs de 24 canettes</h3>
              <p>Les {FLAVORS.length} saveurs Dada en packs de 24 : eaux fruitées, colas et Ice Tea, à commander à l’unité ou en volume.</p>
              <p className="pro-price"><small>le pack </small>{PACK_PRICE}</p>
              <Link href="#devis" className="btn btn-dark pro-cta">Demander un devis</Link>
            </div>
          </li>
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
                <div className="pro-buy">
                  <p className="pro-price">{p.from && <small>à partir de </small>}{formatEUR(p.priceCents)}</p>
                  <Link href="#devis" className="pro-add" aria-label={`Demander un devis pour : ${p.name}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="fine-print">Tarifs repris du site actuel, hors frais de livraison. Conditions détaillées sur devis.</p>
      </div>
    </section>
  );
}
