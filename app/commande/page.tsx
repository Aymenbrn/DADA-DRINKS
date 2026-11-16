import type { Metadata } from "next";
import Checkout from "@/components/cart/Checkout";

export const metadata: Metadata = {
  title: "Paiement",
  robots: { index: false },
};

export default function CommandePage() {
  return (
    <main className="page-light">
      <Checkout />
    </main>
  );
}
