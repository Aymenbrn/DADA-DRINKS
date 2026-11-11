import ProductView from "@/components/product/ProductView";

// Layout commun aux 13 fiches : la scène 3D reste en place quand on passe d'une saveur à l'autre.
export default function SaveursLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <ProductView />
      {children}
    </main>
  );
}
