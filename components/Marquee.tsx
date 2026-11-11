import type { CSSProperties } from "react";
import { FLAVORS } from "@/lib/flavors";

const FONTS: CSSProperties[] = [
  { fontFamily: "var(--display)", fontSize: 44, letterSpacing: "0.02em" },
  { fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 50 },
  { fontFamily: "var(--sans)", fontWeight: 900, fontSize: 42, letterSpacing: "-0.03em" },
  { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 36 },
];

export default function Marquee() {
  const names = FLAVORS.map((f) => f.name.toUpperCase());
  const items = [...names, ...names]; // doublé pour une boucle sans couture
  return (
    <div aria-hidden="true" style={{ overflow: "hidden", padding: "36px 0", background: "var(--ink)" }}>
      <div style={{ transform: "rotate(-2deg)", margin: "0 -60px", padding: "18px 0", background: "var(--accent)", overflow: "hidden" }}>
        <div className="marquee-track">
          {items.map((label, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 36 }}>
              <span style={{ ...FONTS[i % 4], whiteSpace: "nowrap", lineHeight: 1 }}>{i % 4 === 1 ? label.toLowerCase() : label}</span>
              <span style={{ fontSize: 28 }}>✶</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
