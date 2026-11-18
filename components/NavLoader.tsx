"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import DadaFill from "@/components/DadaFill";

/**
 * Chargement long entre deux pages : si la nouvelle page met plus de 450 ms à arriver,
 * le logo Dada qui se remplit s'affiche en plein écran, jusqu'à son arrivée.
 * (Remplace le fichier loading.tsx, qui dupliquait le contenu de la page dans le document.)
 */
export default function NavLoader() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const timer = useRef(0);

  useEffect(() => {
    window.clearTimeout(timer.current);
    setShow(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setShow(true), 450);
    };
    document.addEventListener("click", onClick, true);
    return () => { document.removeEventListener("click", onClick, true); window.clearTimeout(timer.current); };
  }, []);

  if (!show) return null;
  return (
    <div className="page-loading">
      <DadaFill size={260} label="Chargement de la page…" />
      <p className="site-loader-text">Ça se remplit…</p>
    </div>
  );
}
