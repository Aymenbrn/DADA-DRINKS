"use client";

import Flavors from "@/components/Flavors";
import ProShop from "@/components/ProShop";
import { ProReasons, ProTrust, ProQuote } from "@/components/ProDetails";
import { useAudience } from "@/components/AudienceContext";
import AudienceSwitch from "@/components/AudienceSwitch";

/** L'offre sous les canettes : les 13 saveurs (particulier) ou l'offre pro (packs, palettes, frigos) */
export default function HomeShop() {
  const side = useAudience()?.side ?? "particulier";
  return (
    <>
    {/* Entre l'accueil et la boutique : on choisit son espace */}
    <div className="aud-band">
      <p className="aud-band-label">Vous êtes</p>
      <AudienceSwitch className="aud-band-switch" />
    </div>
    <div key={side} className="home-shop-swap">
      {side === "pro" ? (
        <>
          <ProShop />
          <ProReasons />
          <ProTrust />
          <ProQuote />
        </>
      ) : (
        <Flavors />
      )}
    </div>
    </>
  );
}
