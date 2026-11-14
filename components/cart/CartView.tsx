"use client";

import Link from "next/link";
import { useState } from "react";
import RibbonCan from "@/components/RibbonCan";
import { useCart } from "@/components/cart/CartProvider";
import { formatEUR } from "@/lib/flavors";
import { describeLine } from "@/lib/cartItems";

export default function CartView() {
  const { lines, count, totalCents, ready, setQty, remove } = useCart();
  const [checkout, setCheckout] = useState(false);

  return (
    <div className="container cart">
      <header className="cart-head">
        <p className="eyebrow" style={{ color: "var(--muted-on-light)" }}>PANIER</p>
        <h1 className="h-xl" style={{ fontSize: "clamp(44px, 6vw, 84px)" }}>
          Votre panier<span className="serif-i">{count > 0 ? ` · ${count} article${count > 1 ? "s" : ""}` : "."}</span>
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
              const it = describeLine(l.slug, l.pack);
              if (!it) return null;
              return (
                <li key={`${l.slug}-${l.pack}`} className="cart-line">
                  <Link href={it.href} className="cart-thumb" aria-label={`Voir la fiche ${it.name}`}>
                    {it.flavor ? (
                      <RibbonCan flavor={it.flavor} width={28} />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image} alt="" className="cart-pro-thumb" />
                    )}
                  </Link>
                  <div className="cart-info">
                    <Link href={it.href} className="cart-name">{it.name}</Link>
                    <span className="cart-sub">{it.sub} · {formatEUR(it.unitCents)}</span>
                  </div>
                  <div className="qty" role="group" aria-label={`Quantité : ${it.name}`}>
                    <button type="button" aria-label="Un de moins" onClick={() => setQty(l.slug, l.qty - 1, l.pack)}>−</button>
                    <span aria-live="polite">{l.qty}</span>
                    <button type="button" aria-label="Un de plus" onClick={() => setQty(l.slug, l.qty + 1, l.pack)}>+</button>
                  </div>
                  <span className="cart-price">{formatEUR(l.qty * it.unitCents)}</span>
                  <button type="button" className="link-btn" onClick={() => remove(l.slug, l.pack)} aria-label={`Retirer ${it.name} du panier`}>
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
