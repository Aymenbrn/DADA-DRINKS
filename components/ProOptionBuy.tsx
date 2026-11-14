"use client";

import { useState } from "react";
import { formatEUR } from "@/lib/flavors";

/** Fiche pro avec options (palette mixte) : menu déroulant du nombre de packs, prix mis à jour */
export default function ProOptionBuy({ options }: { options: { label: string; priceCents: number }[] }) {
  const [i, setI] = useState(0);
  return (
    <div className="pro-pdp-options">
      <label className="pro-pdp-select">
        <span>NOMBRE DE PACKS</span>
        <select value={i} onChange={(e) => setI(Number(e.target.value))}>
          {options.map((o, k) => (
            <option key={o.label} value={k}>{o.label}</option>
          ))}
        </select>
      </label>
      <div className="pro-pdp-buy">
        <p className="pdp-price">
          {formatEUR(options[i].priceCents)}
          <small>Prix TTC · {options[i].label}</small>
        </p>
        <a href="#devis" className="pdp-buy">Demander un devis</a>
      </div>
      <p className="pro-pdp-note">L’image est une maquette, le choix des packs est à votre initiative.</p>
    </div>
  );
}
