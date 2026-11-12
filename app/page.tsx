import HomeCarousel from "@/components/HomeCarousel";
import Story from "@/components/Story";
import Marquee from "@/components/Marquee";
import HomeShop from "@/components/HomeShop";
import { AudienceProvider } from "@/components/AudienceContext";
import Collabs from "@/components/Collabs";
import Pros from "@/components/Pros";

export default function Home() {
  return (
    <>
      <main>
        <AudienceProvider>
        <HomeCarousel />
        <Marquee />
        <HomeShop />
        </AudienceProvider>
        <Story />
        <Collabs />
        <Pros />
      </main>
    </>
  );
}
