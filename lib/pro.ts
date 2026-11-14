// Offre professionnelle, reprise de la boutique « Professionnels » du site actuel.
// ⚠️ Le site actuel n'indique pas si ces prix sont HT ou TTC : à confirmer avec Dada.

export type ProProduct = {
  slug: string;
  name: string;
  priceCents: number;
  /** « à partir de » pour la palette, dont le prix dépend de la composition */
  from?: boolean;
  /** Colis offerts avec la vitrine */
  freeCases?: number;
  size?: "slim" | "moyen" | "big";
  /** Photo du produit (fond transparent) ; sinon un visuel dessiné */
  image?: string;
  desc: string;
};

export const PRO_PRODUCTS: ProProduct[] = [
  {
    slug: "palette-mixte",
    name: "Palette mixte de packs Dada",
    priceCents: 45000,
    from: true,
    desc: "Composez votre palette avec les saveurs de votre choix, en packs de 24 canettes.",
  },
  {
    slug: "vitrine-slim",
    name: "Vitrine Dada slim",
    priceCents: 71800,
    freeCases: 10,
    size: "slim",
    image: "/pro/vitrine-slim.webp",
    desc: "Le réfrigérateur vitré aux couleurs de Dada pour les petits espaces : caisse, comptoir, snack.",
  },
  {
    slug: "vitrine-moyen",
    name: "Vitrine Dada moyen",
    priceCents: 91800,
    freeCases: 20,
    size: "moyen",
    desc: "Le format intermédiaire pour les épiceries et restaurants qui veulent toute la gamme en vue.",
  },
  {
    slug: "vitrine-big",
    name: "Vitrine Dada big",
    priceCents: 162000,
    freeCases: 24,
    size: "big",
    desc: "La grande vitrine pour les points de vente à fort passage et les supérettes.",
  },
];

export const ESTABLISHMENT_TYPES = [
  "Restaurant / snack",
  "Épicerie / supérette",
  "Grande distribution",
  "Grossiste / distributeur",
  "Événementiel",
  "Autre",
];
