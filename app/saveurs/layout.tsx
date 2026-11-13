import FlavorUniverse from "@/components/product/FlavorUniverse";

// Layout commun aux fiches : l'univers 3D de la saveur (canette, fruits, achat), puis la gamme.
export default function SaveursLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="pdp-page">
      <FlavorUniverse />
      {children}
    </main>
  );
}
