import DadaFill from "@/components/DadaFill";

/** Affiché automatiquement pendant le chargement d'une page un peu longue */
export default function Loading() {
  return (
    <div className="page-loading">
      <DadaFill size={260} label="Chargement de la page…" />
      <p className="site-loader-text">Ça se remplit…</p>
    </div>
  );
}
