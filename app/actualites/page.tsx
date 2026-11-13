import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { NEWS, formatMonth } from "@/lib/news";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Nouveaux produits, partenariats, clips et campagnes : toute l’actualité de Dada Drinks.",
};

export default function ActualitesPage() {
  const [first, ...rest] = NEWS;
  return (
    <main>
      <PageHero eyebrow="ACTUALITÉS" title="Ça bouge" accent="chez Dada." />
      <section className="section page-light">
        <div className="container">
          <article className="news-feature">
            <span className="tag-inline">{first.tag.toUpperCase()} · {formatMonth(first.date)}</span>
            <h2 className="h-xl">{first.title}</h2>
            <p>{first.excerpt}</p>
            <Link href={`/actualites/${first.slug}`} className="btn btn-dark">Lire l’article</Link>
          </article>
          <ul className="news-list">
            {rest.map((n) => {
              const href = n.body ? `/actualites/${n.slug}` : n.external;
              const isExternal = !!href && href.startsWith("http");
              return (
                <li key={n.slug} className={`news-item${n.image ? " has-image" : ""}`}>
                  <span className="news-date">{formatMonth(n.date)}</span>
                  {n.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="news-thumb" src={n.image} alt="" loading="lazy" />
                  )}
                  <div>
                    <span className="tag-inline">{n.tag.toUpperCase()}</span>
                    <h3>
                      {href ? (
                        isExternal ? (
                          <a href={href} target="_blank" rel="noopener noreferrer">{n.title} ↗</a>
                        ) : (
                          <Link href={href}>{n.title}</Link>
                        )
                      ) : (
                        n.title
                      )}
                    </h3>
                    <p>{n.excerpt}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
