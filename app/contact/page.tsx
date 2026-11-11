import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import { SOCIALS, WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question, une commande, un partenariat ? Écrivez à Dada Drinks ou contactez-nous sur WhatsApp.",
};

export default function ContactPage() {
  return (
    <main>
      <PageHero eyebrow="CONTACT" title="Une question ?" accent="On vous répond." />
      <section className="section page-light">
        <div className="container split">
          <div className="contact-side">
            <div>
              <p className="eyebrow" style={{ color: "var(--muted-on-light)" }}>LE PLUS RAPIDE</p>
              <p className="contact-big">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </p>
              <p className="contact-num">{WHATSAPP_DISPLAY}</p>
            </div>
            <div>
              <p className="eyebrow" style={{ color: "var(--muted-on-light)" }}>VOUS ÊTES PRO ?</p>
              <p className="section-lede">Palettes, vitrines, tarifs dédiés : passez par la <Link href="/professionnels#devis">demande de devis</Link>.</p>
            </div>
            <div>
              <p className="eyebrow" style={{ color: "var(--muted-on-light)" }}>SUIVRE DADA</p>
              <ul className="contact-socials">
                {SOCIALS.map((s) => (
                  <li key={s.href}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label} ↗</a></li>
                ))}
              </ul>
            </div>
          </div>
          <ContactForm
            submitLabel="Envoyer"
            successText="Merci pour votre message. Nous vous répondons au plus vite."
            fields={[
              { name: "name", label: "Nom et prénom", required: true, autoComplete: "name" },
              { name: "email", label: "E-mail", type: "email", required: true, autoComplete: "email" },
              { name: "subject", label: "Sujet", type: "select", required: true, wide: true, options: ["Commande particulier", "Professionnel / B to B", "Presse", "Partenariat / collaboration", "Autre"] },
              { name: "message", label: "Votre message", type: "textarea", required: true },
            ]}
          />
        </div>
      </section>
    </main>
  );
}
