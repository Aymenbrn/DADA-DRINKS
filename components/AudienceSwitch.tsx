"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Side = "particulier" | "pro";
const HREF: Record<Side, string> = { particulier: "/", pro: "/professionnels" };

/**
 * Interrupteur façon iPhone : « Particulier » d'un côté, « Pro » de l'autre.
 * Le curseur glisse, puis on change d'espace (accueil particuliers ↔ page professionnels).
 */
export default function AudienceSwitch({ value, className = "" }: { value: Side; className?: string }) {
  const router = useRouter();
  const [side, setSide] = useState<Side>(value);

  const go = (next: Side) => {
    if (next === side) return;
    setSide(next);
    window.setTimeout(() => router.push(HREF[next]), 320); // on laisse le curseur glisser
  };

  return (
    <div className={`aud-switch is-${side} ${className}`} role="radiogroup" aria-label="Espace particulier ou professionnel">
      <span className="aud-knob" aria-hidden="true" />
      <button type="button" role="radio" aria-checked={side === "particulier"} onClick={() => go("particulier")}>
        Particulier
      </button>
      <button type="button" role="radio" aria-checked={side === "pro"} onClick={() => go("pro")}>
        Pro
      </button>
    </div>
  );
}
