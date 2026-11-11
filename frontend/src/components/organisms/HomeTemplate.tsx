import BenefitsSection from "@/components/organisms/BenefitsSection";
import BriefSection from "@/components/organisms/BriefSection";
import FeaturesSection from "@/components/organisms/FeaturesSection";
import HomeEffects from "@/components/molecules/HomeEffects";
import HomeHero from "@/components/organisms/HomeHero";
import LoreSection from "@/components/organisms/LoreSection";
import PatternSection from "@/components/organisms/PatternSection";
import ScopeSection from "@/components/organisms/ScopeSection";
import ThemeSection from "@/components/organisms/ThemeSection";

export default function HomeTemplate() {
  return (
    <>
      <main>
        <HomeHero />
        <div className="bg-white overflow-clip relative z-1">
          <BriefSection />
          <LoreSection />
          <PatternSection />
          <FeaturesSection />
          <ScopeSection />
          <BenefitsSection />
          <ThemeSection />
        </div>
      </main>
      <HomeEffects />
    </>
  );
}
