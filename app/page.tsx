import HomeCarousel from "@/components/HomeCarousel";
import Story from "@/components/Story";
import Marquee from "@/components/Marquee";
import Flavors from "@/components/Flavors";
import Collabs from "@/components/Collabs";
import Pros from "@/components/Pros";

export default function Home() {
  return (
    <>
      <main>
        <HomeCarousel />
        <Marquee />
        <Flavors />
        <Story />
        <Collabs />
        <Pros />
      </main>
    </>
  );
}
