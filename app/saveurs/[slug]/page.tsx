import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FLAVORS, getFlavor } from "@/lib/flavors";

type Props = { params: Promise<{ slug: string }> };

// Une page statique par saveur : /saveurs/cerise, /saveurs/mangue, …
// La fiche 3D elle-même est dans app/saveurs/layout.tsx.
export const dynamicParams = false;

export function generateStaticParams() {
  return FLAVORS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = getFlavor(slug);
  if (!f) return {};
  return {
    title: `Dada ${f.name} — packs de 6 à 32 canettes`,
    description: f.desc,
    openGraph: { title: `Dada ${f.name}`, description: f.desc, locale: "fr_FR", type: "website" },
  };
}

export default async function FlavorPage({ params }: Props) {
  const { slug } = await params;
  if (!getFlavor(slug)) notFound();
  // La fiche (univers 3D, choix de saveur, achat) est dans le layout ; rien en dessous : page entièrement noire
  return null;
}
