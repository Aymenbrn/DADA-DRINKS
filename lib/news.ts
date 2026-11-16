// Actualités, d'après la page « Nos actualités » du site actuel.
// Chaque actualité est un fichier MDX (content/actualites/*.mdx). Celles marquées `article` ont leur propre page
// (/actualites/[slug]) ; les autres renvoient vers un lien externe.

import type { ComponentType } from "react";
import * as a0 from "@/content/actualites/pfl-europe-lyon-2025.mdx";
import * as a1 from "@/content/actualites/pfl-europe-2025.mdx";
import * as a2 from "@/content/actualites/dada-cola.mdx";
import * as a3 from "@/content/actualites/racing-club-de-france.mdx";
import * as a4 from "@/content/actualites/ahmed-el-moussaoui.mdx";
import * as a5 from "@/content/actualites/cedric-doumbe-2024.mdx";
import * as a6 from "@/content/actualites/cedric-doumbe.mdx";
import * as a7 from "@/content/actualites/campagne-taxis.mdx";
import * as a8 from "@/content/actualites/ninho-album.mdx";
import * as a9 from "@/content/actualites/jcdecaux.mdx";
import * as a10 from "@/content/actualites/pub-tv.mdx";
import * as a11 from "@/content/actualites/fianso.mdx";
import * as a12 from "@/content/actualites/jul-clip.mdx";

export type NewsItem = {
  slug: string;
  /** AAAA-MM ; null si la date n'est pas indiquée sur le site actuel */
  date: string | null;
  title: string;
  tag: "Produit" | "Sport" | "Musique" | "Campagne";
  excerpt: string;
  /** true : l'actualité a sa propre page (/actualites/[slug]) avec le texte du fichier MDX */
  article?: boolean;
  external?: string;
  /** Visuel repris de la page « Nos actualités » du site actuel */
  image?: string;
  /** Article ou vidéo externe qui parle de Dada sur ce sujet */
  source?: { label: string; url: string };
  /** Identifiant YouTube du clip, lu directement dans l'actualité */
  video?: string;
};

/** Une actualité = un fichier MDX de content/actualites : `meta` (carte) + texte de l'article */
type NewsModule = { meta: NewsItem; default: ComponentType };

/** Ordre d'affichage (du plus récent au plus ancien) */
const MODULES: NewsModule[] = [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12] as unknown as NewsModule[];

export const NEWS: (NewsItem & { Body?: ComponentType })[] = MODULES.map((m) => ({
  ...m.meta,
  Body: m.meta.article ? m.default : undefined,
}));

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export function formatMonth(date: string | null): string {
  if (!date) return "Nouveauté";
  const [y, m] = date.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export const ARTICLES = NEWS.filter((n) => n.Body);
export const getArticle = (slug: string) => ARTICLES.find((n) => n.slug === slug);

/** Libellé du lien externe : « Voir sur YouTube », « Lire sur Racing Foot »… */
export function sourceText(src: { label: string; url: string }): string {
  return src.label === "YouTube" ? "Voir la vidéo sur YouTube" : `Lire sur ${src.label}`;
}
