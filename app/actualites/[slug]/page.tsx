import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, formatMonth, getArticle } from "@/lib/news";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return { title: a.title, description: a.excerpt, openGraph: { title: a.title, description: a.excerpt, type: "article" } };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a || !a.body) notFound();
  const others = ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 3);
  return (
    <main className="page-light">
      <article className="container article">
        <Link href="/actualites" className="arrow-link">← Toutes les actualités</Link>
        <span className="tag-inline">{a.tag.toUpperCase()} · {formatMonth(a.date)}</span>
        <h1 className="h-xl article-title">{a.title}</h1>
        <p className="article-lede">{a.excerpt}</p>
        {a.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="article-image" src={a.image} alt="" />
        )}
        <div className="prose">
          {a.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </article>
      <section className="container article-more">
        <h2 className="eyebrow" style={{ color: "var(--muted-on-light)" }}>À LIRE AUSSI</h2>
        <ul>
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/actualites/${o.slug}`}>
                <span className="news-date">{formatMonth(o.date)}</span>
                <span>{o.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
