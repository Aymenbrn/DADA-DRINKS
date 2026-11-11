import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegales() {
  return (
    <LegalPage
      title="Mentions"
      accent="légales."
      updated="[DATE]"
      sections={[
        {
          title: "Éditeur du site",
          paragraphs: [
            "Le site est édité par [RAISON SOCIALE], [FORME JURIDIQUE] au capital de [CAPITAL] €, immatriculée au RCS de [VILLE] sous le numéro [SIREN], dont le siège social est situé [ADRESSE].",
            "Numéro de TVA intracommunautaire : [NUMÉRO]. Directeur de la publication : [NOM].",
            "Contact : [E-MAIL] — WhatsApp : +33 7 82 20 61 31.",
          ],
        },
        {
          title: "Hébergement",
          paragraphs: ["Le site est hébergé par Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis — vercel.com."],
        },
        {
          title: "Propriété intellectuelle",
          paragraphs: [
            "La marque Dada Drinks, les logos, les visuels des canettes et l’ensemble des contenus du site sont la propriété de [RAISON SOCIALE] ou de leurs auteurs. Toute reproduction sans autorisation est interdite.",
          ],
        },
        {
          title: "Santé",
          paragraphs: ["Pour votre santé, mangez au moins cinq fruits et légumes par jour. www.mangerbouger.fr"],
        },
      ]}
    />
  );
}
