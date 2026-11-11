type Props = {
  eyebrow: string;
  title: string;
  /** Fin du titre, en italique serif (« la patte Dada ») */
  accent?: string;
  lede?: string;
  children?: React.ReactNode;
};

/** En-tête des pages intérieures : grand titre façon collage, fond noir. */
export default function PageHero({ eyebrow, title, accent, lede, children }: Props) {
  return (
    <section className="page-hero">
      <div className="container page-hero-inner">
        <p className="eyebrow" style={{ color: "var(--muted-on-dark)" }}>{eyebrow}</p>
        <h1 className="h-xl page-hero-title">
          {title}
          {accent && <span className="serif-i"> {accent}</span>}
        </h1>
        {lede && <p className="page-hero-lede">{lede}</p>}
        {children}
      </div>
    </section>
  );
}
