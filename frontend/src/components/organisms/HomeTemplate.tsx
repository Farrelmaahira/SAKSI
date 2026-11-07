"use client";

import BenefitsSection from "@/components/organisms/BenefitsSection";
import BriefSection from "@/components/organisms/BriefSection";
import FeaturesSection from "@/components/organisms/FeaturesSection";
import HomeHero from "@/components/organisms/HomeHero";
import LoreSection from "@/components/organisms/LoreSection";
import PatternSection from "@/components/organisms/PatternSection";
import ScopeSection from "@/components/organisms/ScopeSection";
import ThemeSection from "@/components/organisms/ThemeSection";
import { useHeroSink } from "@/hooks/use-hero-sink";
import { useLoreRings } from "@/hooks/use-lore-rings";
import { useReveal } from "@/hooks/use-reveal";
import { useTextReveal } from "@/hooks/use-text-reveal";

export default function HomeTemplate() {
  useReveal();
  useHeroSink();
  useTextReveal();
  useLoreRings();

  return (
    <main>
      <HomeHero />
      <div className="home-sheet">
        <BriefSection />
        <LoreSection />
        <PatternSection />
        <FeaturesSection />
        <ScopeSection />
        <BenefitsSection />
        <ThemeSection />
      </div>
    </main>
  );
}
