import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function Confidentialite() {
  return (
    <LegalPage
      title="Vos données,"
      accent="en toute transparence."
      updated="[DATE]"
      sections={[
        {
          title: "Données collectées",
          paragraphs: [
            "Formulaires de contact et de devis : nom, e-mail, téléphone et informations sur votre établissement, uniquement pour vous répondre.",
            "Newsletter : votre adresse e-mail, pour vous envoyer les nouveautés Dada. Vous pouvez vous désinscrire à tout moment.",
            "Panier : le contenu de votre panier est enregistré uniquement dans votre navigateur.",
          ],
        },
        {
          title: "Durée de conservation",
          paragraphs: ["[DURÉES À DÉFINIR]"],
        },
        {
          title: "Vos droits",
          paragraphs: [
            "Vous pouvez accéder à vos données, les rectifier ou en demander la suppression en écrivant à [E-MAIL]. Vous pouvez aussi saisir la CNIL (cnil.fr).",
          ],
        },
        {
          title: "Responsable du traitement",
          paragraphs: ["[RAISON SOCIALE], [ADRESSE]."],
        },
      ]}
    />
  );
}
