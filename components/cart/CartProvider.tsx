"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PACK_PRICE_CENTS, getFlavor } from "@/lib/flavors";
import CartDrawer from "@/components/cart/CartDrawer";

export type CartLine = { slug: string; qty: number };

type CartContextValue = {
  lines: CartLine[];
  /** Nombre total de packs */
  count: number;
  totalCents: number;
  /** false tant que le panier enregistré dans le navigateur n'est pas relu */
  ready: boolean;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  /** Volet du panier sur le côté */
  drawerOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "dada-cart-v1";
const MAX_QTY = 99;

/** Panier des particuliers (packs de 24 canettes), gardé dans le navigateur du visiteur. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openCart = useCallback(() => setDrawerOpen(true), []);
  const closeCart = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLines(
            parsed.filter(
              (l): l is CartLine =>
                !!l && typeof l.slug === "string" && typeof l.qty === "number" && l.qty > 0 && !!getFlavor(l.slug)
            )
          );
        }
      }
    } catch {
      // stockage indisponible (navigation privée…) : le panier fonctionne sans mémoire
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignoré
    }
  }, [lines, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback((slug: string, qty = 1) => {
    if (!getFlavor(slug)) return;
    setLines((prev) => {
      const i = prev.findIndex((l) => l.slug === slug);
      if (i < 0) return [...prev, { slug, qty: Math.min(MAX_QTY, qty) }];
      const next = prev.slice();
      next[i] = { slug, qty: Math.min(MAX_QTY, next[i].qty + qty) };
      return next;
    });
    setToast(`Dada ${getFlavor(slug)?.name} ajoutée au panier`);
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.slug !== slug)
        : prev.map((l) => (l.slug === slug ? { slug, qty: Math.min(MAX_QTY, Math.round(qty)) } : l))
    );
  }, []);

  const remove = useCallback((slug: string) => setLines((prev) => prev.filter((l) => l.slug !== slug)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    return { lines, count, totalCents: count * PACK_PRICE_CENTS, ready, add, setQty, remove, clear, drawerOpen, openCart, closeCart };
  }, [lines, ready, add, setQty, remove, clear, drawerOpen, openCart, closeCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
      <div className="cart-toast-zone" role="status" aria-live="polite">
        {toast && (
          <div className="cart-toast">
            <span>{toast}</span>
            <button type="button" className="cart-toast-btn" onClick={() => { setToast(null); setDrawerOpen(true); }}>Voir le panier</button>
          </div>
        )}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
