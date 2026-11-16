import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import ScrollTop from "@/components/ScrollTop";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Police unique du site : Montserrat (titres en Black 900, italiques en Extra Light 200)
const montserrat = Montserrat({
  weight: ["200", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dada Drinks — Casse les codes. Pas la canette.",
    template: "%s | Dada Drinks",
  },
  description:
    "Dada Drinks, la marque de soft drinks née à Nanterre et inspirée du dadaïsme. 13 saveurs pétillantes, en packs de 6 à 32 canettes.",
  openGraph: {
    title: "Dada Drinks",
    description: "Le soft drink né à Nanterre, inspiré du dadaïsme. 13 saveurs, zéro règle.",
    locale: "fr_FR",
    type: "website",
    siteName: "Dada Drinks",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={montserrat.variable}>
      <body>
        <CartProvider>
          <a href="#contenu" className="skip-link">Aller au contenu</a>
          <Header />
          <div id="contenu">{children}</div>
          <Footer />
          <ScrollTop />
        </CartProvider>
      </body>
    </html>
  );
}
