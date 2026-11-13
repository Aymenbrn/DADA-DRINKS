import Link from "next/link";
import PageHero from "@/components/PageHero";

export default function NotFound() {
  return (
    <main>
      <PageHero
        eyebrow="ERREUR 404"
        title="Cette page"
        accent="est partie en voyage."
        lede="Très dada, mais pas très pratique. Elle a peut-être changé d’adresse."
      >
        <div className="hero-actions">
          <Link href="/" className="btn btn-accent">Retour à l’accueil</Link>
          <Link href="/#saveurs" className="btn btn-ghost">Voir la boutique</Link>
        </div>
      </PageHero>
    </main>
  );
}
