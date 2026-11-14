"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import RibbonCan from "@/components/RibbonCan";
import { useCart } from "@/components/cart/CartProvider";
import { formatEUR } from "@/lib/flavors";
import { describeLine } from "@/lib/cartItems";
import { shopHref } from "@/lib/audience";
import { usePathname } from "next/navigation";

/** Panier en petit volet sur le côté : s'ouvre depuis le bouton « Panier », sans quitter la page */
export default function CartDrawer() {
  const { lines, count, totalCents, ready, setQty, remove, drawerOpen, closeCart } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [shop, setShop] = useState("/#saveurs");
  useEffect(() => { if (drawerOpen) setShop(shopHref(pathname)); }, [drawerOpen, pathname]);

  // Échap pour fermer, focus dans le volet à l'ouverture, pas de défilement de la page derrière
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen, closeCart]);

  return (
    <div className={`cart-drawer${drawerOpen ? " is-open" : ""}`} aria-hidden={!drawerOpen}>
      <div className="cart-drawer-backdrop" onClick={closeCart} />
      <div ref={panelRef} className="cart-drawer-panel" role="dialog" aria-modal="true" aria-label="Panier" tabIndex={-1}>
        <header className="cart-drawer-head">
          <p className="cart-drawer-title">
            Panier<span>{count > 0 ? ` · ${count} article${count > 1 ? "s" : ""}` : ""}</span>
          </p>
          <button type="button" className="cart-drawer-close" onClick={closeCart} aria-label="Fermer le panier">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>

        {!ready ? (
          <p className="cart-drawer-empty">Chargement du panier…</p>
        ) : lines.length === 0 ? (
          <div className="cart-drawer-empty">
            <p>Votre panier est vide.</p>
            <Link href={shop} className="btn btn-dark" onClick={closeCart}>Aller à la boutique</Link>
          </div>
        ) : (
          <>
            <ul className="cart-drawer-lines">
              {lines.map((l) => {
                const it = describeLine(l.slug, l.pack);
                if (!it) return null;
                return (
                  <li key={`${l.slug}-${l.pack}`} className="cart-drawer-line">
                    <Link href={it.href} className="cart-drawer-thumb" onClick={closeCart} aria-label={`Voir la fiche ${it.name}`} style={{ background: it.flavor ? it.flavor.c : "#f1efe9" }}>
                      {it.flavor ? (
                        <RibbonCan flavor={it.flavor} width={20} />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.image} alt="" className="cart-pro-thumb" />
                      )}
                    </Link>
                    <div className="cart-drawer-info">
                      <Link href={it.href} onClick={closeCart} className="cart-drawer-name">{it.name}</Link>
                      <span className="cart-drawer-sub">{it.sub} · {formatEUR(it.unitCents)}</span>
                      <div className="cart-drawer-row">
                        <div className="qty qty-sm" role="group" aria-label={`Quantité : ${it.name}`}>
                          <button type="button" aria-label="Un de moins" onClick={() => setQty(l.slug, l.qty - 1, l.pack)}>−</button>
                          <span aria-live="polite">{l.qty}</span>
                          <button type="button" aria-label="Un de plus" onClick={() => setQty(l.slug, l.qty + 1, l.pack)}>+</button>
                        </div>
                        <button type="button" className="link-btn" onClick={() => remove(l.slug, l.pack)} aria-label={`Retirer ${it.name} du panier`}>Retirer</button>
                      </div>
                    </div>
                    <span className="cart-drawer-price">{formatEUR(l.qty * it.unitCents)}</span>
                  </li>
                );
              })}
            </ul>
            <footer className="cart-drawer-foot">
              <p className="cart-drawer-total"><span>Total</span><strong>{formatEUR(totalCents)}</strong></p>
              <Link href="/panier" className="btn btn-dark cart-drawer-cta" onClick={closeCart}>Passer commande</Link>
              <button type="button" className="cart-drawer-continue" onClick={closeCart}>Continuer mes achats</button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
