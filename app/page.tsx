import Hero from "@/components/Hero";
import Story from "@/components/Story";
import Marquee from "@/components/Marquee";
import Flavors from "@/components/Flavors";
import Collabs from "@/components/Collabs";
import Pros from "@/components/Pros";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Story />
        <Marquee />
        <Flavors />
        <Collabs />
        <Pros />
      </main>
    </>
  );
}
