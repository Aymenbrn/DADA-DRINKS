"use client";

import type { ReactNode } from "react";
import { useAudience } from "@/components/AudienceContext";

/** N'affiche son contenu qu'en mode « Particulier » (masqué quand l'interrupteur est sur « Pro ») */
export default function OnlyParticulier({ children }: { children: ReactNode }) {
  const side = useAudience()?.side ?? "particulier";
  return side === "particulier" ? <>{children}</> : null;
}
