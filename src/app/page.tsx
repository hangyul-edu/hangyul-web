import MainSection from "@/components/home/MainSection";
import ServiceIntro from "@/components/home/ServiceIntro";
import KeyFeatures from "@/components/home/KeyFeatures";
import Pricing from "@/components/home/Pricing";
import CtaSection from "@/components/home/CtaSection";

export default function Home() {
  return (
    <main>
      <MainSection />
      <ServiceIntro id="intro" />
      <KeyFeatures id="features" />
      <Pricing id="pricing" />
      <CtaSection />
    </main>
  );
}
