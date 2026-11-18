"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatEUR } from "@/lib/flavors";
import { describeLine } from "@/lib/cartItems";
import { deliveryCents } from "@/lib/shipping";

const METHODS = [
  { id: "carte", label: "Carte bancaire", sub: "Visa, Mastercard, CB" },
  { id: "apple", label: "Apple Pay", sub: "Paiement depuis votre iPhone ou Mac" },
  { id: "google", label: "Google Pay", sub: "Paiement depuis Android ou Chrome" },
  { id: "paypal", label: "PayPal", sub: "Avec ou sans compte PayPal" },
];

/**
 * Étape de paiement : choix du moyen de paiement et récapitulatif de la commande.
 * Le paiement en ligne (Stripe ou Shopify) sera branché à la mise en production ;
 * aucune donnée bancaire n'est saisie ni enregistrée sur cette maquette.
 */
export default function Checkout() {
  const { lines, ready, totalCents } = useCart();
  const [method, setMethod] = useState("carte");
  const [sent, setSent] = useState(false);
  const ship = deliveryCents(totalCents);

  return (
    <div className="container cart checkout">
      <header className="cart-head">
        <p className="eyebrow" style={{ color: "var(--muted-on-light)" }}>PAIEMENT</p>
        <h1 className="h-xl cart-title">
          Moyen de<span className="serif-i"> paiement.</span>
        </h1>
      </header>

      {!ready ? (
        <p className="cart-empty">Chargement…</p>
      ) : lines.length === 0 ? (
        <div className="cart-empty">
          <p>Votre panier est vide.</p>
          <Link href="/#saveurs" className="btn btn-dark">Aller à la boutique</Link>
        </div>
      ) : (
        <div className="cart-grid">
          <section className="checkout-pay" aria-label="Choisir un moyen de paiement">
            <ul className="pay-methods" role="radiogroup" aria-label="Moyen de paiement">
              {METHODS.map((m) => (
                <li key={m.id}>
                  <label className={`pay-method${method === m.id ? " is-on" : ""}`}>
                    <input type="radio" name="pay" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} />
                    <span className="pay-dot" aria-hidden="true" />
                    <span className="pay-text">
                      <strong>{m.label}</strong>
                      <small>{m.sub}</small>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-dark cart-cta" onClick={() => setSent(true)}>
              Payer {formatEUR(totalCents + ship)}
            </button>
            {sent && (
              <p className="cart-notice" role="status">
                Le paiement en ligne sera branché à la mise en production (Stripe ou Shopify). En attendant, écrivez-nous sur{" "}
                <a href="https://wa.me/33782206131" target="_blank" rel="noopener noreferrer">WhatsApp</a> ou via la{" "}
                <Link href="/contact">page contact</Link> pour finaliser votre commande.
              </p>
            )}
            <Link href="/panier" className="cart-continue">← Modifier le panier</Link>
          </section>

          <aside className="cart-summary" aria-label="Récapitulatif">
            <ul className="checkout-lines">
              {lines.map((l) => {
                const it = describeLine(l.slug, l.pack);
                if (!it) return null;
                return (
                  <li key={`${l.slug}-${l.pack}`}>
                    <span>{l.qty} × {it.name} <small>({it.sub.toLowerCase()})</small></span>
                    <strong>{formatEUR(l.qty * it.unitCents)}</strong>
                  </li>
                );
              })}
            </ul>
            <dl>
              <div><dt>Sous-total</dt><dd>{formatEUR(totalCents)}</dd></div>
              <div><dt>Livraison</dt><dd>{ship === 0 ? "Offerte" : formatEUR(ship)}</dd></div>
            </dl>
            <p className="cart-total"><span>Total</span><strong>{formatEUR(totalCents + ship)}</strong></p>
          </aside>
        </div>
      )}
    </div>
  );
}
