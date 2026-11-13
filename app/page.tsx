import HomeCarousel from "@/components/HomeCarousel";
import HomeShop from "@/components/HomeShop";
import { AudienceProvider } from "@/components/AudienceContext";
import OnlyParticulier from "@/components/OnlyParticulier";
import Collabs from "@/components/Collabs";

export default function Home() {
  return (
    <>
      <main>
        <AudienceProvider>
          <HomeCarousel />
          <HomeShop />
          {/* Les collabs ne s'affichent qu'en mode Particulier */}
          <OnlyParticulier>
            <Collabs />
          </OnlyParticulier>
        </AudienceProvider>
      </main>
    </>
  );
}
