import ProductView from "@/components/product/ProductView";
import FlavorUniverse from "@/components/product/FlavorUniverse";

// Layout commun aux 13 fiches : la scène 3D reste en place quand on passe d'une saveur à l'autre.
// Juste dessous, l'univers 3D de la saveur.
export default function SaveursLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <ProductView />
      <FlavorUniverse />
      {children}
    </main>
  );
}
