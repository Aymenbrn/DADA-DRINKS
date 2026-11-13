// Informations générales du site (reprises du site actuel dadadrinks.com)

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dadadrinks.com";

export const NAV = [
  { href: "/boutique", label: "Boutique" },
  { href: "/notre-histoire", label: "Notre histoire" },
  { href: "/collaborations", label: "Collaborations" },
  { href: "/actualites", label: "Actualités" },
  { href: "/contact", label: "Contact" },
];

/** WhatsApp affiché sur le site actuel */
export const WHATSAPP_DISPLAY = "+33 7 82 20 61 31";
export const WHATSAPP_URL = "https://wa.me/33782206131";

export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/dadadrinks/" },
  { label: "TikTok", href: "https://www.tiktok.com/@dadadrinks" },
  { label: "LinkedIn", href: "https://fr.linkedin.com/company/dada-drinks" },
  { label: "Facebook", href: "https://www.facebook.com/dada.drinks.5/" },
];

/** Enseignes citées sur le site actuel */
export const RETAILERS = ["Franprix", "E.Leclerc", "Maximarket"];
