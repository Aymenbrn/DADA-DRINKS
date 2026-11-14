"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatEUR } from "@/lib/flavors";
import { PRO_PREFIX } from "@/lib/cartItems";
import type { ProProduct } from "@/lib/pro";

/** Achat d'un produit pro : (choix du nombre de packs), prix, « Ajouter au panier » et « Demander un devis » */
export default function ProBuy({ product: p }: { product: ProProduct }) {
  const { add } = useCart();
  const [i, setI] = useState(0);
  const opt = p.options?.[i];
  const price = opt ? opt.priceCents : p.priceCents;
  return (
    <div className="pro-pdp-options">
      {p.options && (
        <label className="pro-pdp-select">
          <span>NOMBRE DE PACKS</span>
          <select value={i} onChange={(e) => setI(Number(e.target.value))}>
            {p.options.map((o, k) => (
              <option key={o.label} value={k}>{o.label}</option>
            ))}
          </select>
        </label>
      )}
      <p className="pdp-price">
        {formatEUR(price)}
        <small>{opt ? `Prix TTC · ${opt.label}` : p.freeCases ? `+ ${p.freeCases} colis Dada offerts` : "Prix TTC"}</small>
      </p>
      <div className="pro-pdp-buy">
        <button type="button" className="pdp-buy" onClick={() => add(`${PRO_PREFIX}${p.slug}`, 1, opt ? i : 0)}>
          Ajouter au panier
        </button>
        <a href="#devis" className="pro-pdp-quote">Demander un devis</a>
      </div>
      {p.options && <p className="pro-pdp-note">L’image est une maquette, le choix des packs est à votre initiative.</p>}
    </div>
  );
}
