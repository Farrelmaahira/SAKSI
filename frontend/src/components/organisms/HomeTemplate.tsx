"use client";

import BenefitsSection from "@/components/organisms/BenefitsSection";
import BriefSection from "@/components/organisms/BriefSection";
import FeaturesSection from "@/components/organisms/FeaturesSection";
import HomeHero from "@/components/organisms/HomeHero";
import LoreSection from "@/components/organisms/LoreSection";
import PatternSection from "@/components/organisms/PatternSection";
import ScopeSection from "@/components/organisms/ScopeSection";
import ThemeSection from "@/components/organisms/ThemeSection";
import { useReveal } from "@/hooks/use-reveal";

export default function HomeTemplate() {
  useReveal();

  return (
    <main>
      <HomeHero />
      <BriefSection />
      <LoreSection />
      <PatternSection />
      <FeaturesSection />
      <ScopeSection />
      <BenefitsSection />
      <ThemeSection />
    </main>
  );
}
