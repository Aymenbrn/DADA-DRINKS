"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_PACK, PACK_SIZES, getFlavor, packCents } from "@/lib/flavors";
import CartDrawer from "@/components/cart/CartDrawer";

/** Une ligne = une saveur dans un format de pack (6, 12, 24 ou 32 canettes) */
export type CartLine = { slug: string; qty: number; pack: number };

type CartContextValue = {
  lines: CartLine[];
  /** Nombre total de packs */
  count: number;
  totalCents: number;
  /** false tant que le panier enregistré dans le navigateur n'est pas relu */
  ready: boolean;
  add: (slug: string, qty?: number, pack?: number) => void;
  setQty: (slug: string, qty: number, pack: number) => void;
  remove: (slug: string, pack: number) => void;
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
            parsed
              .filter((l) => !!l && typeof l.slug === "string" && typeof l.qty === "number" && l.qty > 0 && !!getFlavor(l.slug))
              .map((l) => ({
                slug: l.slug as string,
                qty: l.qty as number,
                pack: (PACK_SIZES as readonly number[]).includes(l.pack) ? (l.pack as number) : DEFAULT_PACK, // anciens paniers : pack de 24
              }))
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

  const add = useCallback((slug: string, qty = 1, pack: number = DEFAULT_PACK) => {
    if (!getFlavor(slug)) return;
    setLines((prev) => {
      const i = prev.findIndex((l) => l.slug === slug && l.pack === pack);
      if (i < 0) return [...prev, { slug, qty: Math.min(MAX_QTY, qty), pack }];
      const next = prev.slice();
      next[i] = { slug, pack, qty: Math.min(MAX_QTY, next[i].qty + qty) };
      return next;
    });
    setToast(`Dada ${getFlavor(slug)?.name} (pack de ${pack}) ajoutée au panier`);
  }, []);

  const setQty = useCallback((slug: string, qty: number, pack: number) => {
    const same = (l: CartLine) => l.slug === slug && l.pack === pack;
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !same(l))
        : prev.map((l) => (same(l) ? { ...l, qty: Math.min(MAX_QTY, Math.round(qty)) } : l))
    );
  }, []);

  const remove = useCallback((slug: string, pack: number) => setLines((prev) => prev.filter((l) => !(l.slug === slug && l.pack === pack))), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const totalCents = lines.reduce((n, l) => n + l.qty * packCents(l.pack), 0);
    return { lines, count, totalCents, ready, add, setQty, remove, clear, drawerOpen, openCart, closeCart };
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
