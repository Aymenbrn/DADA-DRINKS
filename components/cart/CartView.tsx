"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RibbonCan from "@/components/RibbonCan";
import { useCart } from "@/components/cart/CartProvider";
import { formatEUR } from "@/lib/flavors";
import { describeLine } from "@/lib/cartItems";
import { deliveryCents } from "@/lib/shipping";
import { shopHref } from "@/lib/audience";
import { usePathname } from "next/navigation";

export default function CartView() {
  const { lines, count, totalCents, ready, setQty, remove } = useCart();
  const pathname = usePathname();
  const [shop, setShop] = useState("/#saveurs");
  useEffect(() => setShop(shopHref(pathname)), [pathname]);

  return (
    <div className="container cart">
      <header className="cart-head">
        <p className="eyebrow" style={{ color: "var(--muted-on-light)" }}>PANIER</p>
        <h1 className="h-xl cart-title">
          Votre panier<span className="serif-i">{count > 0 ? ` · ${count} article${count > 1 ? "s" : ""}` : "."}</span>
        </h1>
      </header>

      {!ready ? (
        <p className="cart-empty">Chargement du panier…</p>
      ) : lines.length === 0 ? (
        <div className="cart-empty">
          <p>Votre panier est vide. Treize saveurs vous attendent.</p>
          <Link href={shop} className="btn btn-dark">Aller à la boutique</Link>
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
              <div><dt>Livraison</dt><dd>{deliveryCents(totalCents) === 0 ? "Offerte" : formatEUR(deliveryCents(totalCents))}</dd></div>
            </dl>
            <p className="cart-total"><span>Total</span><strong>{formatEUR(totalCents + deliveryCents(totalCents))}</strong></p>
            <Link href="/commande" className="btn btn-dark cart-cta">Payer</Link>
            <Link href="/#saveurs" className="cart-continue">← Continuer mes achats</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
