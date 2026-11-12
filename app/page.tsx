import Hero from "@/components/Hero";
import NewLaunch from "@/components/NewLaunch";
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
        <NewLaunch />
        <Story />
        <Marquee />
        <Flavors />
        <Collabs />
        <Pros />
      </main>
    </>
  );
}
