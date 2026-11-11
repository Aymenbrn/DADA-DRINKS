import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Flavors from "@/components/Flavors";
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
    title: `Dada ${f.name} — pack de 24 canettes | Dada Drinks`,
    description: f.desc,
    openGraph: { title: `Dada ${f.name}`, description: f.desc, locale: "fr_FR", type: "website" },
  };
}

export default async function FlavorPage({ params }: Props) {
  const { slug } = await params;
  if (!getFlavor(slug)) notFound();
  // Sous la fiche : toute la gamme, pour continuer la visite
  return <Flavors />;
}
