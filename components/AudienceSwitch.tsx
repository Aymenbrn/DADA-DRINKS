"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAudience, type Audience } from "@/components/AudienceContext";

const HREF: Record<Audience, string> = { particulier: "/", pro: "/professionnels" };

/**
 * Interrupteur façon iPhone : « Particulier » d'un côté, « Pro » de l'autre.
 * Sur l'accueil, il change l'offre affichée plus bas (sans quitter la page) ;
 * ailleurs (page Professionnels), il ramène à l'espace choisi.
 */
export default function AudienceSwitch({ value = "particulier", className = "" }: { value?: Audience; className?: string }) {
  const router = useRouter();
  const ctx = useAudience();
  const [local, setLocal] = useState<Audience>(value);
  const side = ctx ? ctx.side : local;

  const go = (next: Audience) => {
    if (next === side) return;
    if (ctx) {
      ctx.setSide(next);
      return;
    }
    setLocal(next);
    window.setTimeout(() => router.push(HREF[next]), 320); // on laisse le curseur glisser
  };

  return (
    <div className={`aud-switch is-${side} ${className}`} role="radiogroup" aria-label="Offre particulier ou professionnelle">
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
