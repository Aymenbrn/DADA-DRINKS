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
  /** Fiche produit : texte détaillé, format et points forts */
  long: string;
  format: string;
  points: string[];
  /** Caractéristiques techniques fournies par Dada */
  specs?: { label: string; value: string }[];
};

export const PRO_PRODUCTS: ProProduct[] = [
  {
    slug: "palette-mixte",
    name: "Palette mixte de packs Dada",
    priceCents: 45000,
    from: true,
    desc: "Composez votre palette avec les saveurs de votre choix, en packs de 24 canettes.",
    long: "Une palette 100 % Dada, composée selon vos ventes : eaux pétillantes fruitées, colas et Ice Tea, en packs de 24 canettes. Mélangez les saveurs par plateau pour tester la gamme ou miser sur vos meilleures références, avec un bandeau « Saveurs au choix » prêt à poser en rayon.",
    format: "Palette mixte",
    points: ["Saveurs au choix, par plateau", "Packs de 24 canettes 33 cl", "Prête à installer en magasin", "Prix selon la composition"],
  },
  {
    slug: "vitrine-slim",
    name: "Vitrine Dada slim",
    priceCents: 71800,
    freeCases: 10,
    size: "slim",
    image: "/pro/vitrine-slim.webp",
    desc: "Le réfrigérateur vitré aux couleurs de Dada pour les petits espaces : caisse, comptoir, snack.",
    long: "La vitrine réfrigérée Dada la plus compacte : une porte vitrée, un habillage tropical aux couleurs de la marque et des étagères réglables pour mettre les canettes en avant près de la caisse ou sur un petit espace de vente.",
    format: "Vitrine 1 porte, format slim",
    specs: [
      { label: "Dimensions", value: "390 × 480 × 1 880 mm" },
      { label: "Poids", value: "60 kg" },
    ],
    points: ["Porte vitrée et éclairage intérieur", "Habillage Dada sur le flanc et le fronton", "Idéale près de la caisse", "10 colis offerts à la commande"],
  },
  {
    slug: "vitrine-moyen",
    name: "Vitrine Dada moyen",
    priceCents: 91800,
    freeCases: 20,
    size: "moyen",
    image: "/pro/vitrine-moyen.webp",
    desc: "Le format intermédiaire pour les épiceries et restaurants qui veulent toute la gamme en vue.",
    long: "Le format le plus polyvalent : une grande porte vitrée, plus de place pour toute la gamme, l'habillage Dada sur le fronton et le flanc, et des roulettes pour l'installer facilement dans une épicerie, un snack ou un restaurant.",
    format: "Vitrine 1 porte, grand format",
    specs: [
      { label: "Dimensions", value: "610 × 670 × 2 000 mm" },
      { label: "Poids", value: "92 kg" },
    ],
    points: ["Toute la gamme en vue", "Étagères réglables", "Montée sur roulettes", "20 colis offerts à la commande"],
  },
  {
    slug: "vitrine-big",
    name: "Vitrine Dada big",
    priceCents: 162000,
    freeCases: 24,
    size: "big",
    image: "/pro/vitrine-big.webp",
    desc: "La grande vitrine pour les points de vente à fort passage et les supérettes.",
    long: "La vitrine double porte Dada pour les points de vente à fort passage : deux portes vitrées, une grande capacité et un habillage XXL aux couleurs de la marque, pensé pour les supérettes et la grande distribution.",
    format: "Vitrine 2 portes",
    points: ["Double porte vitrée", "Grande capacité, toute la gamme", "Montée sur roulettes", "24 colis offerts à la commande"],
  },
];

export const getPro = (slug: string) => PRO_PRODUCTS.find((p) => p.slug === slug);

export const ESTABLISHMENT_TYPES = [
  "Restaurant / snack",
  "Épicerie / supérette",
  "Grande distribution",
  "Grossiste / distributeur",
  "Événementiel",
  "Autre",
];
