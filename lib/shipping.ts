// Frais de livraison (particuliers).
// ⚠️ Montants provisoires, à valider avec Dada : le site actuel n'indique pas de frais de livraison.
export const DELIVERY_CENTS = 590;
/** Livraison offerte à partir de ce montant (sous-total) */
export const FREE_DELIVERY_FROM_CENTS = 6000;

export function deliveryCents(subtotalCents: number) {
  if (subtotalCents <= 0) return 0;
  return subtotalCents >= FREE_DELIVERY_FROM_CENTS ? 0 : DELIVERY_CENTS;
}
