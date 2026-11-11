import type { Metadata } from "next";
import { Anton, Instrument_Serif, Inter_Tight, Montserrat, Space_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const serif = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-serif", display: "swap" });
const inter = Inter_Tight({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-mono", display: "swap" });
// Typo des noms de saveur sur les étiquettes 3D
const montserrat = Montserrat({ weight: "900", subsets: ["latin"], variable: "--font-montserrat", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dada Drinks — Casse les codes. Pas la canette.",
    template: "%s | Dada Drinks",
  },
  description:
    "Dada Drinks, la marque de soft drinks née à Nanterre et inspirée du dadaïsme. 13 saveurs pétillantes, en pack de 24 canettes.",
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
    <html lang="fr" className={`${anton.variable} ${serif.variable} ${inter.variable} ${mono.variable} ${montserrat.variable}`}>
      <body>
        <CartProvider>
          <a href="#contenu" className="skip-link">Aller au contenu</a>
          <Header />
          <div id="contenu">{children}</div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
