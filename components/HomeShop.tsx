"use client";

import Flavors from "@/components/Flavors";
import ProShop from "@/components/ProShop";
import { useAudience } from "@/components/AudienceContext";

/** L'offre sous les canettes : les 13 saveurs (particulier) ou l'offre pro (packs, palettes, frigos) */
export default function HomeShop() {
  const side = useAudience()?.side ?? "particulier";
  return (
    <div key={side} className="home-shop-swap">
      {side === "pro" ? <ProShop /> : <Flavors />}
    </div>
  );
}
