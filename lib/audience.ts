// Dernier côté choisi par le visiteur (« particulier » ou « pro »), gardé dans le navigateur
// pour adapter les raccourcis (ex. « Aller à la boutique » du panier).
export type Side = "particulier" | "pro";
const KEY = "dada-audience";

export function rememberSide(side: Side) {
  try { window.localStorage.setItem(KEY, side); } catch { /* stockage indisponible */ }
}

export function lastSide(): Side {
  try { return window.localStorage.getItem(KEY) === "pro" ? "pro" : "particulier"; } catch { return "particulier"; }
}

/** Boutique à proposer : l'offre pro pour un professionnel, sinon les saveurs */
export function shopHref(pathname: string) {
  return pathname.startsWith("/professionnels") || lastSide() === "pro" ? "/#offre-pro" : "/#saveurs";
}
