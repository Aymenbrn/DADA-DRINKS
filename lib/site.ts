// Informations générales du site (reprises du site actuel dadadrinks.com)

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dadadrinks.com";

export const NAV = [
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
/** Enseignes et distributeurs qui référencent Dada (d'après la page boutique du site actuel) */
// Logos officiels des enseignes (repris de la page « Notre histoire » de dadadrinks.com, servis par leur hébergeur)
const LOGO_CDN = "https://images.squarespace-cdn.com/content/v1/64218fe88bd257683c3684a0/";
export const RETAILER_LOGOS: { name: string; logo: string }[] = [
  { name: "Carrefour", logo: `${LOGO_CDN}1691744605492-HIKP3AOEPEW1V9418W58/Sans-titre-3_03.png?format=300w` },
  { name: "E.Leclerc", logo: `${LOGO_CDN}1695812525868-K40WDR8IE4IREBP2HO9W/leclerc.png?format=300w` },
  { name: "Auchan", logo: `${LOGO_CDN}1691744582841-KG5I8SFYD1T5W2TZXCCF/Sans-titre-3_01.png?format=300w` },
  { name: "Intermarché", logo: `${LOGO_CDN}1691744654620-WYMI6M68BGDIVZXJA5O6/Sans-titre-3_07.png?format=300w` },
  { name: "Super U", logo: `${LOGO_CDN}1691744649396-68G4RETRQ8TXUJPGGTE0/Sans-titre-3_06.png?format=300w` },
  { name: "Franprix", logo: `${LOGO_CDN}1695812392971-3DO6O8B40ZCZR01VQFC1/franprix.png?format=300w` },
  { name: "Metro", logo: `${LOGO_CDN}1691744595454-4LIFN9QSKPRBTTGRLSN2/Sans-titre-3_02.png?format=300w` },
  { name: "Promocash", logo: `${LOGO_CDN}1768560370537-6074TAG2Z5FY6J29QHV3/ky.png?format=300w` },
  { name: "B&M", logo: `${LOGO_CDN}1691744639008-R22PR1ZH3FZ8PDNMYZFC/Sans-titre-3_04.png?format=300w` },
  { name: "Coccimarket", logo: `${LOGO_CDN}1691744644468-93MYFEU7WBX82RXZA1O8/Sans-titre-3_05.png?format=300w` },
  { name: "G20", logo: `${LOGO_CDN}1695812282250-XWT8Q4OKTZIOK4GHBXJQ/g20.png?format=300w` },
  { name: "Maxi Market", logo: `${LOGO_CDN}1719239794331-4YACVRT87D9AD2U36TBJ/maximarket.png?format=300w` },
  { name: "MSA Market", logo: `${LOGO_CDN}1731945556961-6OM78DV3XE7YCQ72QKQP/msa+website.png?format=300w` },
  { name: "Khadispal", logo: `${LOGO_CDN}1719239699314-QLTZN36IN06CCBJF46Y2/Khadispal.png?format=300w` },
  { name: "IDF Distribution", logo: `${LOGO_CDN}1731945542940-KCBMY12MJ6ZNGRDSIXVH/IDF+WEBSITE.png?format=300w` },
];

export const RETAILERS = [
  "Carrefour", "E.Leclerc", "Auchan", "Intermarché", "Super U", "Franprix",
  "Metro", "Promocash", "B&M", "Coccimarket", "G20", "Maxi Market",
  "MSA Market", "Khadispal", "IDF Distribution",
];
