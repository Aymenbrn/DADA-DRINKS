"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { NAV } from "@/lib/site";

export default function Header() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [open, setOpen] = useState(false);

  // Le menu mobile se referme à chaque changement de page
  useEffect(() => setOpen(false), [pathname]);

  // Accueil : en-tête transparent sur la scène plein écran, noir dès qu'on défile
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Les fiches produit s'ouvrent seules (fiche + pied de page) : elles ont leur propre petite barre
  if (pathname.startsWith("/saveurs/")) return null;

  return (
    <header className={`site-header${isHome ? " is-home" : ""}${isHome && !scrolled && !open ? " is-transparent" : ""}${scrolled && !open ? " is-glass" : ""}`}>
      <div className="container header">
        <Link href="/" className="logo" aria-label="Dada Drinks, accueil">
          <Image src="/brand/dada-logo.webp" alt="Dada" width={750} height={303} priority className="logo-img" />
        </Link>

        <nav id="main-nav" className={`nav${open ? " is-open" : ""}`} aria-label="Navigation principale">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isCurrent(n.href) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {pathname.startsWith("/professionnels/") && (
            <Link href="/#offre-pro" className="header-back">← Toute l’offre pro</Link>
          )}
          {/* Accueil : l'interrupteur Particulier / Pro vient se placer ici (voir HomeCarousel) */}
          {isHome && <div id="header-aud-slot" className="header-aud-slot" />}
          <button type="button" className="pill pill-light" onClick={openCart} aria-haspopup="dialog" aria-label={`Ouvrir le panier, ${count} pack${count > 1 ? "s" : ""}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2.5 3.5h2.6l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.3a1.6 1.6 0 0 0 1.6-1.2l1.7-7.3H6.2" />
              <circle cx="9.5" cy="20" r="1.4" />
              <circle cx="17.5" cy="20" r="1.4" />
            </svg>
            <span className="cart-label">Panier · </span>
            <span className="cart-count">{count}</span>
          </button>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="main-nav"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
