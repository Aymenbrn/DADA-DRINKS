import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Pro3D from "@/components/Pro3D";
import { ProQuote } from "@/components/ProDetails";
import { PRO_PRODUCTS, getPro } from "@/lib/pro";
import { formatEUR, pad } from "@/lib/flavors";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PRO_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getPro(slug);
  if (!p) return {};
  return { title: `${p.name} — Professionnels`, description: p.desc };
}

/** Fiche produit de l'offre pro : produit en 3D, description, prix, points forts, puis la demande de devis */
export default async function ProProductPage({ params }: Props) {
  const { slug } = await params;
  const p = getPro(slug);
  if (!p) notFound();
  const index = PRO_PRODUCTS.findIndex((x) => x.slug === p.slug);
  const [first, ...rest] = p.name.split(" ");
  const lead = p.size ? `${first} ${rest[0]}` : first; // « Vitrine Dada » / « Palette »
  const tail = p.size ? rest.slice(1).join(" ") : rest.join(" ");

  return (
    <main>
      <section className="pro-pdp" aria-labelledby="pro-title">
        <nav className="pro-pdp-nav" aria-label="Les produits pros">
          <ul>
            {PRO_PRODUCTS.map((x) => (
              <li key={x.slug}>
                <Link href={`/professionnels/${x.slug}`} aria-current={x.slug === p.slug ? "page" : undefined} scroll={false}>
                  {x.name.replace(" de packs Dada", "")}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="container pro-pdp-inner">
          <div className="pro-pdp-copy">
            <p className="pdp-eyebrow">PROFESSIONNELS — {p.format.toUpperCase()} — N° {pad(index)} / {PRO_PRODUCTS.length}</p>
            <h1 id="pro-title" className="h-xl pro-pdp-title">
              {lead} <span className="serif-i">{tail}.</span>
            </h1>
            <p className="pro-pdp-lede">{p.long}</p>
            <div className="pro-pdp-buy">
              <p className="pdp-price">
                {p.from && <small className="pro-pdp-from">à partir de</small>}
                {formatEUR(p.priceCents)}
                <small>{p.freeCases ? `+ ${p.freeCases} colis Dada offerts` : "selon la composition de la palette"}</small>
              </p>
              <a href="#devis" className="pdp-buy">Demander un devis</a>
            </div>
            <ul className="pro-pdp-points">
              {p.points.map((pt) => <li key={pt}>{pt}</li>)}
            </ul>
            <p className="pro-pdp-wa">
              Une question ? <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp · {WHATSAPP_DISPLAY}</a>
            </p>
          </div>
          <div className="pro-pdp-stage" aria-label={`${p.name} en 3D`} role="img">
            <Pro3D key={p.slug} kind={p.size ?? "pallet"} fallback={p.image ?? "/pro/palette.webp"} />
          </div>
        </div>
      </section>
      <ProQuote />
    </main>
  );
}
