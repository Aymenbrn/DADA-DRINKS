import { canBg, type Flavor } from "@/lib/flavors";

type Props = {
  flavor: Flavor;
  /** Largeur en px, la hauteur suit les proportions d'une canette 33 cl */
  width?: number;
  showLabels?: boolean;
};

/** Canette dessinée en CSS : à remplacer par des rendus 3D/photos officiels si Dada en fournit. */
export default function Can({ flavor, width = 230, showLabels = true }: Props) {
  const height = Math.round(width * 1.87);
  const rim = Math.round(width * 0.13);
  return (
    <div className="can" style={{ width, height }} role="img" aria-label={`Canette Dada ${flavor.name}`}>
      <div className="can-top" style={{ left: width * 0.03, right: width * 0.03, height: rim }} />
      <div
        className="can-body"
        style={{
          top: rim / 2,
          bottom: rim / 2,
          borderRadius: `${Math.round(width * 0.1)}px / ${rim}px`,
          background: canBg(flavor.c),
          color: flavor.ink,
        }}
      >
        {showLabels && (
          <span className="can-kicker" style={{ top: width * 0.17, fontSize: Math.max(8, width * 0.045) }}>
            SOFT DRINK
          </span>
        )}
        <span className="can-word" style={{ fontSize: width * 0.56 }}>
          DADA
        </span>
        {showLabels && (
          <span className="can-name" style={{ bottom: width * 0.13, fontSize: width * 0.115 }}>
            {flavor.name}
          </span>
        )}
      </div>
      <div className="can-bottom" style={{ left: width * 0.04, right: width * 0.04, height: rim * 0.93 }} />
    </div>
  );
}
