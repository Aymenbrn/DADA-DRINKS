/**
 * Petit indicateur de chargement : le logo Dada qui se remplit de boisson, en boucle.
 * Pur CSS (aucun script) : utilisable pendant le chargement d'une page ou d'une scène 3D.
 */
export default function DadaFill({ size = 220, label = "Chargement…" }: { size?: number; label?: string }) {
  return (
    <span className="dada-fill" role="status" aria-label={label} style={{ width: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="dada-fill-empty" src="/brand/dada-logo.webp" alt="" width={750} height={303} />
      <span className="dada-fill-clip">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/dada-logo.webp" alt="" width={750} height={303} />
      </span>
    </span>
  );
}
