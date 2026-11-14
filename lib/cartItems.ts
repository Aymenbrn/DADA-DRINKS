// Lignes du panier : canettes (saveur + format de pack) ou produits pros (vitrines, palette + option)
import { DEFAULT_PACK, PACK_SIZES, flavorHref, getFlavor, packCents, type Flavor } from "@/lib/flavors";
import { getPro } from "@/lib/pro";

export const PRO_PREFIX = "pro:";
export const isProSlug = (slug: string) => slug.startsWith(PRO_PREFIX);

export type LineInfo = {
  name: string;
  sub: string;
  unitCents: number;
  href: string;
  flavor?: Flavor;
  image?: string;
};

/** Décrit une ligne (nom, détail, prix unitaire, lien, visuel) ; null si elle n'existe plus */
export function describeLine(slug: string, pack: number): LineInfo | null {
  if (isProSlug(slug)) {
    const p = getPro(slug.slice(PRO_PREFIX.length));
    if (!p) return null;
    const opt = p.options?.[pack];
    if (p.options && !opt) return null;
    return {
      name: p.name,
      sub: opt ? opt.label : p.freeCases ? `+ ${p.freeCases} colis offerts` : "Offre pro",
      unitCents: opt ? opt.priceCents : p.priceCents,
      href: `/professionnels/${p.slug}`,
      image: p.image ?? "/pro/palette.webp",
    };
  }
  const f = getFlavor(slug);
  if (!f) return null;
  return { name: `Dada ${f.name}`, sub: `Pack de ${pack} canettes`, unitCents: packCents(pack), href: flavorHref(f.slug), flavor: f };
}

/** Format valide pour une ligne relue du navigateur */
export function normalizePack(slug: string, pack: unknown): number {
  if (isProSlug(slug)) return typeof pack === "number" && pack >= 0 ? pack : 0;
  return (PACK_SIZES as readonly number[]).includes(pack as number) ? (pack as number) : DEFAULT_PACK;
}
