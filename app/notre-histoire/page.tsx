import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Notre histoire",
  description:
    "De Nanterre à la Malaisie, de la canette transparente aux rayons de la grande distribution : l’histoire de Mohamed, fondateur de Dada Drinks.",
};

// D'après la page « Notre histoire » du site actuel
const STEPS = [
  {
    when: "Les débuts",
    title: "Un aîné de Nanterre",
    text: "Mohamed grandit à Nanterre, aîné d’une famille modeste. Vendeur sur les marchés, voiturier, groom, livreur : il enchaîne les petits boulots et garde de sa famille une énergie qui ne le quittera plus.",
    quote: "Ma famille m’a transmis sa niaque.",
  },
  {
    when: "Le premier pari",
    title: "La pizzeria",
    text: "Le gérant d’une pizzeria repère son potentiel et lui propose de reprendre l’affaire. Il emprunte, rachète, modernise et efface les dettes en un an. Il en retient une leçon : c’est l’expérience client qui crée la fidélité.",
  },
  {
    when: "Le déclic",
    title: "Le voyage",
    text: "Il part plusieurs mois en Australie et en Asie du Sud-Est, en travaillant dans des fermes et des restaurants pour financer le voyage. En Malaisie, il découvre une boisson locale pétillante et fruitée, et mesure à quel point l’offre de soft drinks est limitée en France.",
  },
  {
    when: "2007",
    title: "Naissance de Dada",
    text: "Il conçoit une canette transparente, le packaging et le logo, imprime brochures et flyers. Les supermarchés hésitent ; les restaurants et les épiceries de quartier, eux, se lancent. Les grossistes suivent peu à peu.",
  },
  {
    when: "2009",
    title: "Le coup dur",
    text: "Un gros contrat arrive, mais l’entreprise n’a pas encore les moyens de le livrer. Il faut réduire la voilure pour reconstruire sur des bases solides.",
  },
  {
    when: "2011",
    title: "Ne jamais lâcher",
    text: "D’autres projets voient le jour, une marque de tiramisu, un restaurant, mais Dada reste dans un coin de sa tête. Une rencontre avec Xavier Fontanet, alors PDG d’Essilor, lors d’une formation à HEC, relance sa motivation. Un associé potentiel lui prédit l’échec : raison de plus pour s’accrocher.",
    quote: "Ils voulaient me décourager, mais cela m’a au contraire poussé à m’accrocher !",
  },
  {
    when: "Le renouveau",
    title: "Dada repart",
    text: "Nouveau logo, nouvelle communication, réseaux sociaux, partenariats avec des influenceurs et des artistes, nouveaux clients : la croissance revient.",
  },
  {
    when: "Aujourd’hui",
    title: "À côté des géants",
    text: "Les canettes Dada sont en rayon à côté des sodas les plus célèbres, en supermarché comme en supérette. Prochaines étapes : une usine en France, plus de présence en ligne et toujours plus de points de vente partout dans le pays.",
  },
];

export default function HistoirePage() {
  return (
    <main>
      <PageHero
        eyebrow="NOTRE HISTOIRE"
        title="De la banlieue"
        accent="à l’entrepreneuriat."
        lede="Dada Drinks, c’est l’histoire de Mohamed, parti de Nanterre avec une idée de boisson qui ne ressemblait à aucune autre."
      />

      <section className="section page-light">
        <div className="container">
          <ol className="timeline">
            {STEPS.map((s, i) => (
              <li key={s.title} className="tl-item">
                <span className="tl-when">{s.when}</span>
                <div className="tl-body">
                  <span className="tl-n">{String(i + 1).padStart(2, "0")}</span>
                  <h2>{s.title}</h2>
                  <p>{s.text}</p>
                  {s.quote && <blockquote>« {s.quote} »<cite>Mohamed, fondateur</cite></blockquote>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band-dark">
        <div className="container band-inner">
          <p className="band-text">Le nom vient du dadaïsme : l’audace de casser les codes. On vous raconte tout sur la page d’accueil.</p>
          <div className="hero-actions">
            <Link href="/#histoire" className="btn btn-light">L’histoire Dada en 6 actes</Link>
            <Link href="/boutique" className="btn btn-accent">Goûter la gamme</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
