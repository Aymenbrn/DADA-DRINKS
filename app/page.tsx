import HomeCarousel from "@/components/HomeCarousel";
import Story from "@/components/Story";
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
          {/* L'histoire et les collabs ne s'affichent qu'en mode Particulier */}
          <OnlyParticulier>
            <Story />
            <Collabs />
          </OnlyParticulier>
        </AudienceProvider>
      </main>
    </>
  );
}
