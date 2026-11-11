// Actualités, d'après la page « Nos actualités » du site actuel.
// Les articles avec un `body` ont leur propre page (/actualites/[slug]) ; les autres renvoient vers un lien externe.

export type NewsItem = {
  slug: string;
  /** AAAA-MM ; null si la date n'est pas indiquée sur le site actuel */
  date: string | null;
  title: string;
  tag: "Produit" | "Sport" | "Musique" | "Campagne";
  excerpt: string;
  body?: string[];
  external?: string;
};

export const NEWS: NewsItem[] = [
  {
    slug: "pfl-europe-2025",
    date: "2025-09",
    title: "Dada Drinks, partenaire de la PFL Europe à Nantes et à Lyon",
    tag: "Sport",
    excerpt: "La ligue de MMA s'associe à Dada Drinks pour ses soirées du 26 septembre à Nantes et du 13 décembre à Lyon.",
    body: [
      "La Professional Fighters League (PFL) a annoncé un partenariat stratégique avec Dada Drinks pour ses deux événements PFL Europe de 2025 en France : Nantes le 26 septembre et Lyon le 13 décembre.",
      "Concrètement, les canettes Dada sont présentes dans les zones d'échauffement et à la table des annonceurs, et la marque est visible directement dans la cage.",
      "Pour Dada Drinks, l'objectif est de grandir avec un sport en pleine expansion en France et de rejoindre une communauté de fans qui partage son goût de l'audace. Le partenariat prolonge l'histoire de la marque avec le MMA, déjà engagée aux côtés de Cédric Doumbé.",
    ],
  },
  {
    slug: "dada-cola",
    date: null,
    title: "Dada Drinks dévoile sa nouvelle star : le Dada Cola",
    tag: "Produit",
    excerpt: "Le cola de Dada Drinks rejoint la gamme, avec ses déclinaisons Zero et Cherry.",
    body: [
      "Le cola de Dada Drinks rejoint la gamme : gazeux, rafraîchissant, au goût unique, à servir bien frais.",
      "Il est disponible en pack de 24 canettes, aux côtés du Cola Zero (zéro sucre, zéro calorie) et du Cola Cherry, aux notes de cerise intensément fruitées.",
    ],
  },
  {
    slug: "ahmed-el-moussaoui",
    date: "2024-02",
    title: "Ahmed El Moussaoui vêtu de Dada pour son combat face à Bakary Samaké",
    tag: "Sport",
    excerpt: "Le combattant monte sur le ring aux couleurs de Dada Drinks.",
    external: "https://www.youtube.com/watch?v=6gqA0SK_Lko",
  },
  {
    slug: "cedric-doumbe-2024",
    date: "2024-02",
    title: "Cédric Doumbé annonce sa collaboration avec Dada Drinks pour 2024",
    tag: "Sport",
    excerpt: "L'ambassadeur de la marque prolonge l'aventure pour une nouvelle saison.",
    external: "/actualites/cedric-doumbe",
  },
  {
    slug: "cedric-doumbe",
    date: "2023-10",
    title: "Dada Drinks, partenaire officiel de Cédric Doumbé",
    tag: "Sport",
    excerpt: "Au Zénith de Paris, l'ambassadeur Dada met Jordan Zebo KO en 9 secondes.",
    body: [
      "Samedi 30 septembre 2023, au Zénith de Paris, Cédric Doumbé affrontait Jordan Zebo en tête d'affiche de la PFL Paris, devant des milliers de spectateurs, dont Kylian Mbappé et plusieurs joueurs du PSG.",
      "Le combat avait été précédé de semaines de provocations sur les réseaux sociaux et en interview, jusqu'à un matelas envoyé à son adversaire et un oreiller à l'effigie de son entraîneur, Fernand Lopez, offert à la pesée.",
      "Pour son retour après plusieurs mois de blessure, Doumbé a mis fin au combat en 9 secondes, d'une série de trois droites après une tentative de high kick de Zebo.",
      "Neuf secondes : à peu près le temps de savourer une gorgée de Dada. Cédric Doumbé fait partie de la team « Dadaddict », que la marque invite tous ses fans à rejoindre.",
    ],
  },
  {
    slug: "campagne-taxis",
    date: "2023-09",
    title: "Dada Drinks s'affiche sur les taxis parisiens avec JCDecaux",
    tag: "Campagne",
    excerpt: "Après les panneaux JCDecaux, la marque passe sur les taxis d'Île-de-France en septembre et octobre.",
    body: [
      "Après plusieurs campagnes sur les panneaux JCDecaux, Dada Drinks a choisi un nouveau format : l'affichage sur les taxis, partout en Île-de-France et à Paris, en septembre et octobre 2023.",
      "Déjà très appréciée des 10-25 ans, la marque veut se faire connaître d'un public plus large.",
      "Les boissons Dada sont disponibles dans toute l'Île-de-France, en petites, moyennes et grandes surfaces.",
    ],
  },
  {
    slug: "ninho-album",
    date: "2023-06",
    title: "Ninho cite Dada Drinks dans son dernier album",
    tag: "Musique",
    excerpt: "Un big up à la marque de Nanterre dans le nouvel album du rappeur.",
  },
  {
    slug: "jcdecaux",
    date: "2023-06",
    title: "JCDecaux et Dada Drinks s'allient pour une campagne publicitaire",
    tag: "Campagne",
    excerpt: "Les canettes Dada sur les panneaux JCDecaux.",
  },
  {
    slug: "pub-tv",
    date: "2023-05",
    title: "Dada Drinks voit sa pub à la TV",
    tag: "Campagne",
    excerpt: "La publicité Dada Drinks passe à la télévision.",
  },
  {
    slug: "fianso",
    date: "2023-02",
    title: "Fianso et son Dada dans son dernier clip",
    tag: "Musique",
    excerpt: "La canette Dada fait une apparition dans le clip du rappeur.",
    external: "https://www.youtube.com/watch?v=XZ6q-w7XXQE",
  },
  {
    slug: "jul-clip",
    date: "2023-01",
    title: "Jul dévoile son clip en collaboration avec Dada",
    tag: "Musique",
    excerpt: "« Canette dans les mains », un clip réalisé avec Dada.",
    external: "https://www.youtube.com/watch?v=iFY615_FQOw",
  },
];

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export function formatMonth(date: string | null): string {
  if (!date) return "Nouveauté";
  const [y, m] = date.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export const ARTICLES = NEWS.filter((n) => n.body);
export const getArticle = (slug: string) => ARTICLES.find((n) => n.slug === slug);
