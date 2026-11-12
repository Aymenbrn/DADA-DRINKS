"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Audience = "particulier" | "pro";

const Ctx = createContext<{ side: Audience; setSide: (s: Audience) => void } | null>(null);

/** Choix « Particulier / Pro » partagé par l'accueil (interrupteur en haut, offre en dessous) */
export function AudienceProvider({ children }: { children: ReactNode }) {
  const [side, setSide] = useState<Audience>("particulier");
  return <Ctx.Provider value={{ side, setSide }}>{children}</Ctx.Provider>;
}

export const useAudience = () => useContext(Ctx);
