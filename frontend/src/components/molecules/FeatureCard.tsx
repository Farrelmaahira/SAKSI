import Illustration from '@/components/atoms/Illustration'
import type { Feature } from '@/interfaces/content'

export interface FeatureCardProps {
  feature: Feature
  index: number
}

export default function FeatureCard({ feature, index }: FeatureCardProps) {
  return (
    <article className="feature-card">
      <div className="feature-img">
        <span className="feature-no">0{index + 1}</span>
        {feature.tag && <span className="feature-tag">{feature.tag}</span>}
        <Illustration name={feature.image} loading="lazy" />
      </div>
      <h3>{feature.title}</h3>
      <p>{feature.text}</p>
    </article>
  )
}
