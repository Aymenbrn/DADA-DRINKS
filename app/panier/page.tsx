import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Panier",
  robots: { index: false },
};

export default function PanierPage() {
  return (
    <main className="page-light">
      <CartView />
    </main>
  );
}
