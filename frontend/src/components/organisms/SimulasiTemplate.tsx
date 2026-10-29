'use client'

import AboutSection from '@/components/organisms/AboutSection'
import CtaBand from '@/components/organisms/CtaBand'
import FaqSection from '@/components/organisms/FaqSection'
import SimulasiHero from '@/components/organisms/SimulasiHero'
import SimulatorSection from '@/components/organisms/SimulatorSection'
import { useReveal } from '@/hooks/use-reveal'

export default function SimulasiTemplate() {
  useReveal()

  return (
    <main>
      <SimulasiHero />
      <AboutSection />
      <SimulatorSection />
      <FaqSection />
      <CtaBand />
    </main>
  )
}
