import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { COLLABS } from "@/lib/collabs";

export const metadata: Metadata = {
  title: "Collaborations",
  description: "Ninho, Jul, Alonzo, Paris Basket, JCDecaux, PFL, Cédric Doumbé : les collaborations de Dada Drinks.",
};

const KIND_STYLE: Record<string, { bg: string; fg: string }> = {
  Musique: { bg: "#0A0A0A", fg: "#F4F2EE" },
  Sport: { bg: "var(--accent)", fg: "#0A0A0A" },
  Affichage: { bg: "#E6FF3A", fg: "#0A0A0A" },
  Influence: { bg: "#F4F2EE", fg: "#0A0A0A" },
};

export default function CollaborationsPage() {
  return (
    <main>
      <PageHero
        eyebrow="COLLABS & CULTURE"
        title="Ils ont tenu"
        accent="la canette."
        lede="Rap, MMA, basket, affichage : là où la culture se passe, la canette Dada n’est jamais loin."
      />
      <section className="section page-light">
        <div className="container">
          <ul className="collab-grid">
            {COLLABS.map((c, i) => {
              const k = KIND_STYLE[c.kind];
              const external = c.link?.href.startsWith("http");
              return (
                <li key={c.slug} className="collab-card">
                  <div className="collab-visual halftone" style={{ backgroundColor: k.bg, color: k.fg }} aria-hidden="true">
                    <span className="collab-big" style={{ transform: `rotate(${i % 2 ? 3 : -3}deg)` }}>{c.title}</span>
                    {/* Remplacer par le visuel officiel (photo, extrait du clip) */}
                  </div>
                  <div className="collab-body">
                    <span className="tag-inline">{c.kind.toUpperCase()}</span>
                    <h2>{c.title}{c.work && <span className="serif-i"> — {c.work}</span>}</h2>
                    <p>{c.text}</p>
                    {c.parts && (
                      <ul className="collab-parts">
                        {c.parts.map((p) => (
                          <li key={p.title}>
                            {p.link ? (
                              <a href={p.link} target="_blank" rel="noopener noreferrer">{p.title} — « {p.work} » ↗</a>
                            ) : (
                              <span>{p.title} — « {p.work} »</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    {c.link &&
                      (external ? (
                        <a href={c.link.href} target="_blank" rel="noopener noreferrer" className="arrow-link">{c.link.label} ↗</a>
                      ) : (
                        <Link href={c.link.href} className="arrow-link">{c.link.label} →</Link>
                      ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <section className="band band-accent">
        <div className="container band-inner">
          <p className="band-text">Artiste, club, média ou marque : une idée de collaboration avec Dada ?</p>
          <Link href="/contact" className="btn btn-dark">Nous écrire</Link>
        </div>
      </section>
    </main>
  );
}
