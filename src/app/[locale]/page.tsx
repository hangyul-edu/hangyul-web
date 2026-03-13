import { use } from "react";
import { setRequestLocale } from "next-intl/server";

import MainSection from "@/components/home/MainSection";
import ServiceIntro from "@/components/home/ServiceIntro";
import KeyFeatures from "@/components/home/KeyFeatures";
import Pricing from "@/components/home/Pricing";
import CtaSection from "@/components/home/CtaSection";

export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);

  setRequestLocale(locale);

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
