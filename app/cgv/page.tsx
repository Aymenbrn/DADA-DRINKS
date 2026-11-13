import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default function CGV() {
  return (
    <LegalPage
      title="Conditions générales"
      accent="de vente."
      updated="[DATE]"
      sections={[
        {
          title: "1. Objet",
          paragraphs: ["Les présentes conditions régissent les ventes de boissons Dada Drinks aux particuliers sur ce site, par packs de 6, 12, 24 ou 32 canettes."],
        },
        {
          title: "2. Prix",
          paragraphs: ["Les prix sont indiqués en euros toutes taxes comprises, hors frais de livraison, qui sont précisés avant la validation de la commande. [À VALIDER]"],
        },
        {
          title: "3. Commande et paiement",
          paragraphs: ["La commande est confirmée après paiement en ligne sécurisé. [MOYENS DE PAIEMENT ACCEPTÉS]"],
        },
        {
          title: "4. Livraison",
          paragraphs: ["[ZONES, DÉLAIS ET TRANSPORTEUR]"],
        },
        {
          title: "5. Droit de rétractation",
          paragraphs: [
            "Conformément au Code de la consommation, vous disposez de 14 jours à compter de la réception pour exercer votre droit de rétractation, sauf pour les produits descellés qui ne peuvent être renvoyés pour des raisons d’hygiène ou de protection de la santé. [À VALIDER PAR UN JURISTE]",
          ],
        },
        {
          title: "6. Service client",
          paragraphs: ["Pour toute question : la page Contact du site, ou WhatsApp au +33 7 82 20 61 31."],
        },
      ]}
    />
  );
}
