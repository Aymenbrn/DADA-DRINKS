"use client";

import Link from "next/link";
import { useState } from "react";
import Can from "@/components/Can";
import { useCart } from "@/components/cart/CartProvider";
import { PACK_PRICE_CENTS, flavorHref, formatEUR, getFlavor } from "@/lib/flavors";

export default function CartView() {
  const { lines, count, totalCents, ready, setQty, remove } = useCart();
  const [checkout, setCheckout] = useState(false);

  return (
    <div className="container cart">
      <header className="cart-head">
        <p className="eyebrow" style={{ color: "var(--muted-on-light)" }}>PANIER</p>
        <h1 className="h-xl" style={{ fontSize: "clamp(44px, 6vw, 84px)" }}>
          Votre panier<span className="serif-i">{count > 0 ? ` · ${count} pack${count > 1 ? "s" : ""}` : "."}</span>
        </h1>
      </header>

      {!ready ? (
        <p className="cart-empty">Chargement du panier…</p>
      ) : lines.length === 0 ? (
        <div className="cart-empty">
          <p>Votre panier est vide. Treize saveurs vous attendent.</p>
          <Link href="/#saveurs" className="btn btn-dark">Aller à la boutique</Link>
        </div>
      ) : (
        <div className="cart-grid">
          <ul className="cart-lines">
            {lines.map((l) => {
              const f = getFlavor(l.slug);
              if (!f) return null;
              return (
                <li key={l.slug} className="cart-line">
                  <Link href={flavorHref(f.slug)} className="cart-thumb" aria-label={`Voir la fiche Dada ${f.name}`}>
                    <Can flavor={f} width={44} showLabels={false} />
                  </Link>
                  <div className="cart-info">
                    <Link href={flavorHref(f.slug)} className="cart-name">Dada {f.name}</Link>
                    <span className="cart-sub">Pack de 24 canettes · {formatEUR(PACK_PRICE_CENTS)}</span>
                  </div>
                  <div className="qty" role="group" aria-label={`Quantité de Dada ${f.name}`}>
                    <button type="button" aria-label="Un pack de moins" onClick={() => setQty(l.slug, l.qty - 1)}>−</button>
                    <span aria-live="polite">{l.qty}</span>
                    <button type="button" aria-label="Un pack de plus" onClick={() => setQty(l.slug, l.qty + 1)}>+</button>
                  </div>
                  <span className="cart-price">{formatEUR(l.qty * PACK_PRICE_CENTS)}</span>
                  <button type="button" className="link-btn" onClick={() => remove(l.slug)} aria-label={`Retirer Dada ${f.name} du panier`}>
                    Retirer
                  </button>
                </li>
              );
            })}
          </ul>

          <aside className="cart-summary" aria-label="Récapitulatif">
            <dl>
              <div><dt>Sous-total</dt><dd>{formatEUR(totalCents)}</dd></div>
              <div><dt>Livraison</dt><dd>Calculée à l’étape suivante</dd></div>
            </dl>
            <p className="cart-total"><span>Total</span><strong>{formatEUR(totalCents)}</strong></p>
            <button type="button" className="btn btn-dark cart-cta" onClick={() => setCheckout(true)}>
              Passer commande
            </button>
            {checkout && (
              <p className="cart-notice" role="status">
                Le paiement en ligne sera branché à la mise en production (Stripe ou Shopify). En attendant, écrivez-nous sur{" "}
                <a href="https://wa.me/33782206131" target="_blank" rel="noopener noreferrer">WhatsApp</a> ou via la{" "}
                <Link href="/contact">page contact</Link> pour finaliser votre commande.
              </p>
            )}
            <Link href="/#saveurs" className="cart-continue">← Continuer mes achats</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
