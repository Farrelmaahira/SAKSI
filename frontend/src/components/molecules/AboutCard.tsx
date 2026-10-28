import type { AboutItem } from '@/interfaces/content'

export interface AboutCardProps {
  item: AboutItem
  index: number
}

export default function AboutCard({ item, index }: AboutCardProps) {
  return (
    <article data-reveal>
      <span className="about-no">0{index + 1}</span>
      <h3>{item.title}</h3>
      <p>{item.text}</p>
    </article>
  )
}
