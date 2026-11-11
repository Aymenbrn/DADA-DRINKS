// Collaborations, d'après les pages « Nos collaborations » et « Nos actualités » du site actuel.

export type Collab = {
  slug: string;
  title: string;
  /** Sous-titre : titre du clip, événement… */
  work?: string;
  kind: "Musique" | "Sport" | "Affichage" | "Influence";
  text: string;
  link?: { href: string; label: string };
  /** Collaborations regroupées sous un même partenariat */
  parts?: { title: string; work: string; link?: string }[];
};

export const COLLABS: Collab[] = [
  {
    slug: "ninho",
    title: "Ninho",
    work: "Carolina",
    kind: "Musique",
    text: "La canette Dada apparaît dans le clip de « Carolina ». Ninho cite aussi la marque dans son album de 2023.",
  },
  {
    slug: "jul",
    title: "Jul",
    work: "Canette dans les mains",
    kind: "Musique",
    text: "Un clip réalisé en collaboration avec Dada, dévoilé en janvier 2023.",
    link: { href: "https://www.youtube.com/watch?v=iFY615_FQOw", label: "Voir le clip" },
  },
  {
    slug: "paris-basket",
    title: "Dada x Paris Basket",
    kind: "Sport",
    text: "Sous la bannière Dada x Paris Basket, deux clips où la canette Dada tient la vedette.",
    parts: [
      { title: "Jul", work: "Canette dans les mains", link: "https://www.youtube.com/watch?v=iFY615_FQOw" },
      { title: "Sofiane ft. Soolking", work: "Nouveaux parrains" },
    ],
  },
  {
    slug: "alonzo",
    title: "Alonzo",
    work: "Compliqué",
    kind: "Musique",
    text: "Dada s'invite dans le clip de « Compliqué ».",
  },
  {
    slug: "fianso",
    title: "Fianso",
    work: "Clip 2023",
    kind: "Musique",
    text: "Une canette Dada en vedette dans le clip de Fianso, en février 2023.",
    link: { href: "https://www.youtube.com/watch?v=XZ6q-w7XXQE", label: "Voir le clip" },
  },
  {
    slug: "pfl",
    title: "PFL Europe",
    work: "Nantes et Lyon, 2025",
    kind: "Sport",
    text: "Partenaire officiel des soirées MMA de la PFL Europe à Nantes et à Lyon : canettes en coulisses, à la table des annonceurs et logo dans la cage.",
    link: { href: "/actualites/pfl-europe-2025", label: "Lire l'article" },
  },
  {
    slug: "cedric-doumbe",
    title: "Cédric Doumbé",
    work: "Ambassadeur",
    kind: "Sport",
    text: "Le champion de kickboxing et de MMA est ambassadeur de Dada Drinks depuis 2023.",
    link: { href: "/actualites/cedric-doumbe", label: "Lire l'article" },
  },
  {
    slug: "jcdecaux",
    title: "Dada x JCDecaux",
    work: "Affichage et taxis parisiens",
    kind: "Affichage",
    text: "Des campagnes d'affichage sur les panneaux JCDecaux, puis sur les taxis d'Île-de-France en septembre et octobre 2023.",
    link: { href: "/actualites/campagne-taxis", label: "Lire l'article" },
  },
  {
    slug: "influenceurs",
    title: "Dada x Influenceurs",
    kind: "Influence",
    text: "Des partenariats avec des créateurs de contenu pour faire découvrir la gamme sur les réseaux sociaux.",
  },
];
