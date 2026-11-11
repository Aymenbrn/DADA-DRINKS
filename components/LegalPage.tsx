import PageHero from "@/components/PageHero";

export type LegalSection = { title: string; paragraphs: string[] };

/**
 * Gabarit des pages légales. Les éléments entre crochets [ … ] sont à compléter
 * avec les informations officielles de la société (Kbis, hébergeur, etc.).
 */
export default function LegalPage({ title, accent, updated, sections }: { title: string; accent?: string; updated: string; sections: LegalSection[] }) {
  return (
    <main>
      <PageHero eyebrow="INFORMATIONS LÉGALES" title={title} accent={accent} lede={`Dernière mise à jour : ${updated}`} />
      <section className="section page-light">
        <div className="container prose legal">
          {sections.map((s) => (
            <section key={s.title}>
              <h2>{s.title}</h2>
              {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
