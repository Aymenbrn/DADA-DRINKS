import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { StoryTimeline } from "@/components/OurStory";
import StoryCompare from "@/components/StoryCompare";

export const metadata: Metadata = {
  title: "Notre histoire",
  description:
    "De Nanterre à la Malaisie, de la canette transparente aux rayons de la grande distribution : l’histoire de Mohamed, fondateur de Dada Drinks.",
};

export default function HistoirePage() {
  return (
    <main>
      <PageHero
        eyebrow="NOTRE HISTOIRE"
        title="De la banlieue"
        accent="à l’entrepreneuriat."
        lede="Dada Drinks, c’est l’histoire de Mohamed, parti de Nanterre avec une idée de boisson qui ne ressemblait à aucune autre."
      />

      <section className="section cmp-section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">NOUVEAU · AVANT / APRÈS</p>
            <h2 className="h-xl section-title">
              2007 → aujourd’hui<span className="serif-i"> : glissez pour voir.</span>
            </h2>
            <p className="section-lede">Du logo rond et de la canette transparente des débuts au Dada d’aujourd’hui. Faites glisser la poignée.</p>
          </div>
          <StoryCompare />
        </div>
      </section>

      <section className="section page-light">
        <div className="container">
          <StoryTimeline />
        </div>
      </section>

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
