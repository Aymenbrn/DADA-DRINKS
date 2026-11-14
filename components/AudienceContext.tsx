"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Audience = "particulier" | "pro";

const Ctx = createContext<{ side: Audience; setSide: (s: Audience) => void } | null>(null);

/**
 * Choix « Particulier / Pro » partagé par l'accueil (interrupteur en haut, offre en dessous).
 * Un lien vers /#offre-pro ouvre directement l'accueil côté Pro, sur l'offre pro.
 */
export function AudienceProvider({ children }: { children: ReactNode }) {
  const [side, setSide] = useState<Audience>("particulier");

  useEffect(() => {
    const go = () => {
      if (window.location.hash !== "#offre-pro") return;
      setSide("pro");
      // l'offre pro n'existe qu'une fois le côté Pro affiché : on attend son rendu pour y descendre
      let tries = 0;
      const seek = () => {
        const el = document.getElementById("offre-pro");
        if (el) el.scrollIntoView({ block: "start" });
        else if (tries++ < 30) requestAnimationFrame(seek);
      };
      requestAnimationFrame(seek);
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, []);

  return <Ctx.Provider value={{ side, setSide }}>{children}</Ctx.Provider>;
}

export const useAudience = () => useContext(Ctx);
