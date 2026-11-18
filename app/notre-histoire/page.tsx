import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import StoryScroll from "@/components/StoryScroll";
import StarSky from "@/components/StarSky";

export const metadata: Metadata = {
  title: "Notre histoire",
  description:
    "De Nanterre à la Malaisie, de la canette transparente aux rayons de la grande distribution : l’histoire de Mohamed, fondateur de Dada Drinks.",
};

export default function HistoirePage() {
  return (
    <main>
      <div className="story-top">
      <PageHero
        eyebrow="NOTRE HISTOIRE"
        title="De la banlieue"
        accent="à l’entrepreneuriat."
        lede="Dada Drinks, c’est l’histoire de Mohamed, parti de Nanterre avec une idée de boisson qui ne ressemblait à aucune autre."
        decor={<StarSky />}
      />

      </div>

      <StoryScroll />

      <section className="band band-dark">
        <div className="container band-inner">
          <p className="band-text">Le nom vient du dadaïsme : l’audace de casser les codes. On vous raconte tout sur la page d’accueil.</p>
          <div className="hero-actions">
            <Link href="/#histoire" className="btn btn-light">L’histoire Dada en 6 actes</Link>
            <Link href="/#saveurs" className="btn btn-accent">Goûter la gamme</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
