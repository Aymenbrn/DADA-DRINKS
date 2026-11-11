import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Flavors from "@/components/Flavors";
import { PACK_PRICE } from "@/lib/flavors";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Les 13 saveurs Dada Drinks en pack de 24 canettes, livrées chez vous.",
};

const PERKS = [
  { k: "Pack de 24", v: "canettes par saveur" },
  { k: PACK_PRICE, v: "le pack, soit 1,33 € la canette" },
  { k: "13 saveurs", v: "fruitées, colas et thé glacé" },
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
