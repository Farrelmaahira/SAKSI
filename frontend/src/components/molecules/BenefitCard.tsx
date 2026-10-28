import Illustration from '@/components/atoms/Illustration'
import type { Benefit } from '@/interfaces/content'

export interface BenefitCardProps {
  benefit: Benefit
}

export default function BenefitCard({ benefit }: BenefitCardProps) {
  return (
    <article className="benefit-card" data-reveal>
      <div className="benefit-img">
        <Illustration name={benefit.image} loading="lazy" />
      </div>
      <h3>{benefit.title}</h3>
      <p>{benefit.text}</p>
    </article>
  )
}
