"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_PACK } from "@/lib/flavors";
import { describeLine, normalizePack } from "@/lib/cartItems";
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

/** Panier des particuliers (packs de 6 à 32 canettes), gardé dans le navigateur du visiteur. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const toastId = useRef(0);
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
              .filter((l) => !!l && typeof l.slug === "string" && typeof l.qty === "number" && l.qty > 0)
              .map((l) => ({ slug: l.slug as string, qty: l.qty as number, pack: normalizePack(l.slug, l.pack) })) // anciens paniers : pack de 24
              .filter((l) => !!describeLine(l.slug, l.pack))
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

  // Plusieurs ajouts à la suite : un toast par ajout, empilés en bas à droite, chacun disparaît seul
  const pushToast = useCallback((text: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, text }].slice(-4));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const add = useCallback((slug: string, qty = 1, pack: number = DEFAULT_PACK) => {
    const info = describeLine(slug, pack);
    if (!info) return;
    setLines((prev) => {
      const i = prev.findIndex((l) => l.slug === slug && l.pack === pack);
      if (i < 0) return [...prev, { slug, qty: Math.min(MAX_QTY, qty), pack }];
      const next = prev.slice();
      next[i] = { slug, pack, qty: Math.min(MAX_QTY, next[i].qty + qty) };
      return next;
    });
    pushToast(`${info.name} (${info.sub.toLowerCase()}) ajouté au panier`);
  }, [pushToast]);

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
    const totalCents = lines.reduce((n, l) => n + l.qty * (describeLine(l.slug, l.pack)?.unitCents ?? 0), 0);
    return { lines, count, totalCents, ready, add, setQty, remove, clear, drawerOpen, openCart, closeCart };
  }, [lines, ready, add, setQty, remove, clear, drawerOpen, openCart, closeCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
      <div className="cart-toast-zone" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div className="cart-toast" key={t.id}>
            <span>{t.text}</span>
            <button type="button" className="cart-toast-btn" onClick={() => { setToasts([]); setDrawerOpen(true); }}>Voir le panier</button>
          </div>
        ))}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
