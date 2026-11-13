import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Flavors from "@/components/Flavors";
import { FLAVORS, FROM_PRICE } from "@/lib/flavors";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Les saveurs Dada Drinks en packs de 6, 12, 24 ou 32 canettes, livrées chez vous.",
};

const PERKS = [
  { k: "6 · 12 · 24 · 32", v: "canettes par pack, au choix" },
  { k: `dès ${FROM_PRICE}`, v: "soit 1,33 € la canette" },
  { k: `${FLAVORS.length} saveurs`, v: "fruitées, colas et thé glacé" },
];

export default function BoutiquePage() {
  return (
    <main>
      <PageHero
        eyebrow="BOUTIQUE — PARTICULIERS"
        title="Toute la gamme,"
        accent="livrée chez vous."
        lede="Choisissez vos saveurs, ajoutez-les au panier, mélangez les packs. Ouvrez une fiche pour faire tourner la canette en 3D."
      >
        <dl className="perks">
          {PERKS.map((p) => (
            <div key={p.k}>
              <dt>{p.k}</dt>
              <dd>{p.v}</dd>
            </div>
          ))}
        </dl>
      </PageHero>
      <Flavors />
      <section className="band band-accent">
        <div className="container band-inner">
          <p className="band-text">Vous êtes un professionnel ? Palettes, vitrines réfrigérées et tarifs dédiés.</p>
          <Link href="/professionnels" className="btn btn-dark">Voir l’offre pro</Link>
        </div>
      </section>
    </main>
  );
}
