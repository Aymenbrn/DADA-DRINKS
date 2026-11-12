import ContactForm from "@/components/ContactForm";
import { ESTABLISHMENT_TYPES } from "@/lib/pro";
import { RETAILERS, WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site";

// Contenu de l'espace professionnel, partagé par la page /professionnels et l'accueil (mode « Pro »)

const REASONS = [
  { n: "01", t: "Une marque qui fait vendre", d: "Des clips avec Jul et Ninho, des campagnes JCDecaux, des partenariats MMA : vos clients connaissent déjà la canette." },
  { n: "02", t: "13 saveurs, une seule commande", d: "Composez une palette mixte avec les eaux fruitées, les colas et l’Ice Tea, en packs de 24." },
  { n: "03", t: "La vitrine qui attire l’œil", d: "Trois tailles de vitrines réfrigérées aux couleurs de Dada, livrées avec des colis offerts." },
  { n: "04", t: "Un interlocuteur direct", d: "Une question, une commande urgente : on vous répond directement, y compris sur WhatsApp." },
];

const HIGHLIGHTS = [
  { t: "Dada x Jul", d: "Une figure majeure du rap français, un clip en collaboration avec Dada." },
  { t: "Dada x Ninho", d: "Le rappeur, dont les clips cumulent plus de 150 millions de vues, a fait apparaître la canette Dada." },
  { t: "Dada x JCDecaux", d: "Panneaux d’affichage puis taxis parisiens : la marque s’affiche dans toute l’Île-de-France." },
];

/** Pourquoi Dada : quatre raisons */
export function ProReasons() {
  return (
        <section className="section page-light">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow" style={{ color: "var(--muted-on-light)" }}>POURQUOI DADA</p>
              <h2 className="h-xl section-title">Quatre bonnes raisons<span className="serif-i"> de dire oui.</span></h2>
            </div>
            <ol className="reasons">
              {REASONS.map((r) => (
                <li key={r.n}>
                  <span className="reason-n">{r.n}</span>
                  <h3>{r.t}</h3>
                  <p>{r.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
  );
}

/** Ils nous ont fait confiance : enseignes, salons, collaborations */
export function ProTrust() {
  return (
        <section className="section page-dark">
          <div className="container split">
            <div>
              <p className="eyebrow" style={{ color: "var(--muted-on-dark)" }}>ILS NOUS ONT FAIT CONFIANCE</p>
              <h2 className="h-xl section-title">Déjà<span className="serif-i"> en rayon.</span></h2>
              <ul className="retailers">
                {RETAILERS.map((r) => <li key={r}>{r}</li>)}
              </ul>
              <p className="salon"><span>LES SALONS</span> Dada était présent à l’ANUGA 2023, le grand salon international de l’alimentation à Cologne.</p>
            </div>
            <ul className="highlights">
              {HIGHLIGHTS.map((h) => (
                <li key={h.t}>
                  <h3>{h.t}</h3>
                  <p>{h.d}</p>
                </li>
              ))}
              <li><a href="/collaborations" className="arrow-link">Toutes nos collaborations →</a></li>
            </ul>
          </div>
        </section>
  );
}

/** Demande de devis (formulaire + WhatsApp) */
export function ProQuote() {
  return (
        <section id="devis" className="section page-light">
          <div className="container split">
            <div>
              <p className="eyebrow" style={{ color: "var(--muted-on-light)" }}>DEMANDE DE DEVIS</p>
              <h2 className="h-xl section-title">Parlons<span className="serif-i"> volumes.</span></h2>
              <p className="section-lede">Dites-nous qui vous êtes et ce dont vous avez besoin : nous revenons vers vous avec une proposition adaptée.</p>
              <p className="section-lede">Plus rapide : <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp au {WHATSAPP_DISPLAY}</a>.</p>
            </div>
            <ContactForm
              subject="Demande de devis pro"
              submitLabel="Envoyer ma demande"
              successText="Merci ! Nous revenons vers vous rapidement avec une proposition."
              fields={[
                { name: "company", label: "Établissement / société", required: true, autoComplete: "organization" },
                { name: "type", label: "Type d’établissement", type: "select", options: ESTABLISHMENT_TYPES, required: true },
                { name: "name", label: "Nom et prénom", required: true, autoComplete: "name" },
                { name: "email", label: "E-mail", type: "email", required: true, autoComplete: "email" },
                { name: "phone", label: "Téléphone", type: "tel", autoComplete: "tel" },
                { name: "city", label: "Ville", autoComplete: "address-level2" },
                { name: "interest", label: "Vous êtes intéressé par", type: "select", options: ["Packs de 24 canettes", "Palette mixte", "Vitrine slim", "Vitrine moyen", "Vitrine big", "Plusieurs produits"], wide: true },
                { name: "message", label: "Votre besoin (saveurs, volumes, fréquence…)", type: "textarea", required: true },
              ]}
            />
          </div>
        </section>
  );
}
