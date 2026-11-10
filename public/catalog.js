export const products = [
  {
    id: "mangue",
    name: "Mangue",
    category: "fruits",
    color: "#ffc135",
    accent: "#fc752b",
    icon: "🥭",
    note: "Une envie de soleil ?",
    description:
      "Une saveur mangue pour mettre une touche tropicale dans votre pause.",
    price: 3200,
  },
  {
    id: "cerise",
    name: "Cerise",
    category: "fruits",
    color: "#e97aa2",
    accent: "#bc214f",
    icon: "🍒",
    note: "Le fruit qui voit la vie en rose.",
    description:
      "Le caractère de la cerise dans un pack à partager bien frais.",
    price: 3200,
  },
  {
    id: "lemon",
    name: "Lemon",
    category: "fruits",
    color: "#f1ed54",
    accent: "#a2bb36",
    icon: "🍋",
    note: "Un petit coup de pep’s.",
    description:
      "Une boisson rafraîchissante gazéifiée au goût unique. À servir frais.",
    price: 3200,
  },
  {
    id: "cola",
    name: "Cola",
    category: "classiques",
    color: "#d76b4e",
    accent: "#99352a",
    icon: "✦",
    note: "Classique. Jamais ordinaire.",
    description:
      "Découvrez le Cola de Dada Drinks, une boisson rafraîchissante gazéifiée au goût unique. À servir frais.",
    price: 3200,
  },
  {
    id: "pomme",
    name: "Pomme",
    category: "fruits",
    color: "#b9d778",
    accent: "#5e933b",
    icon: "🍏",
    note: "Une pause au vert.",
    description: "La saveur pomme à découvrir en pack de 24 canettes.",
    price: 3200,
  },
  {
    id: "ice-tea",
    name: "Ice Tea",
    category: "classiques",
    color: "#efaf72",
    accent: "#c26d34",
    icon: "☀",
    note: "Le temps de prendre le temps.",
    description:
      "Un pack Ice Tea pour vos moments de pause. À déguster bien frais.",
    price: 3200,
  },
  {
    id: "cola-zero",
    name: "Cola Zéro",
    category: "classiques",
    color: "#9c96b3",
    accent: "#494154",
    icon: "✦",
    note: "Tout le caractère du cola.",
    description:
      "Le Cola Zéro de Dada Drinks : zéro sucre, zéro calorie. À servir frais.",
    price: 3200,
  },
];
export const formatMoney = (cents) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
export function sanitizeCart(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    products.flatMap((p) =>
      Number.isInteger(value[p.id]) && value[p.id] > 0
        ? [[p.id, Math.min(value[p.id], 24)]]
        : [],
    ),
  );
}
export function cartTotal(cart) {
  const safe = sanitizeCart(cart);
  return products.reduce((total, p) => total + p.price * (safe[p.id] || 0), 0);
}
export function cartCount(cart) {
  return Object.values(sanitizeCart(cart)).reduce(
    (total, quantity) => total + quantity,
    0,
  );
}
