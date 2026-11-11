import RevealEffect from "@/components/atoms/RevealEffect";
import AboutSection from "@/components/organisms/AboutSection";
import CtaBand from "@/components/organisms/CtaBand";
import FaqSection from "@/components/organisms/FaqSection";
import SimulasiHero from "@/components/organisms/SimulasiHero";
import SimulatorSection from "@/components/organisms/SimulatorSection";

export default function SimulasiTemplate() {
  return (
    <>
      <main>
        <SimulasiHero />
        <AboutSection />
        <SimulatorSection />
        <FaqSection />
        <CtaBand />
      </main>
      <RevealEffect />
    </>
  );
}
