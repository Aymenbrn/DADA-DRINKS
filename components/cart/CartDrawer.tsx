"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import RibbonCan from "@/components/RibbonCan";
import { useCart } from "@/components/cart/CartProvider";
import { flavorHref, formatEUR, getFlavor, packCents } from "@/lib/flavors";

/** Panier en petit volet sur le côté : s'ouvre depuis le bouton « Panier », sans quitter la page */
export default function CartDrawer() {
  const { lines, count, totalCents, ready, setQty, remove, drawerOpen, closeCart } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

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
            Panier<span>{count > 0 ? ` · ${count} pack${count > 1 ? "s" : ""}` : ""}</span>
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
            <Link href="/#saveurs" className="btn btn-dark" onClick={closeCart}>Aller à la boutique</Link>
          </div>
        ) : (
          <>
            <ul className="cart-drawer-lines">
              {lines.map((l) => {
                const f = getFlavor(l.slug);
                if (!f) return null;
                return (
                  <li key={`${l.slug}-${l.pack}`} className="cart-drawer-line">
                    <Link href={flavorHref(f.slug)} className="cart-drawer-thumb" onClick={closeCart} aria-label={`Voir la fiche Dada ${f.name}`} style={{ background: f.c }}>
                      <RibbonCan flavor={f} width={20} />
                    </Link>
                    <div className="cart-drawer-info">
                      <Link href={flavorHref(f.slug)} onClick={closeCart} className="cart-drawer-name">Dada {f.name}</Link>
                      <span className="cart-drawer-sub">Pack de {l.pack} · {formatEUR(packCents(l.pack))}</span>
                      <div className="cart-drawer-row">
                        <div className="qty qty-sm" role="group" aria-label={`Quantité de Dada ${f.name}`}>
                          <button type="button" aria-label="Un pack de moins" onClick={() => setQty(l.slug, l.qty - 1, l.pack)}>−</button>
                          <span aria-live="polite">{l.qty}</span>
                          <button type="button" aria-label="Un pack de plus" onClick={() => setQty(l.slug, l.qty + 1, l.pack)}>+</button>
                        </div>
                        <button type="button" className="link-btn" onClick={() => remove(l.slug, l.pack)} aria-label={`Retirer Dada ${f.name} du panier`}>Retirer</button>
                      </div>
                    </div>
                    <span className="cart-drawer-price">{formatEUR(l.qty * packCents(l.pack))}</span>
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
