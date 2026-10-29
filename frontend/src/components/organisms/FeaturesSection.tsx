'use client'

import { useRef, useState } from 'react'
import Arrow from '@/components/atoms/Arrow'
import FeatureCard from '@/components/molecules/FeatureCard'
import { features } from '@/data/home'

export default function FeaturesSection() {
  const [active, setActive] = useState(0)
  const track = useRef<HTMLDivElement>(null)

  const step = () => {
    const card = track.current?.querySelector<HTMLElement>('.feature-card')
    return card ? card.offsetWidth + parseFloat(getComputedStyle(track.current!).columnGap || '0') : 0
  }

  const slide = (direction: number) => track.current?.scrollBy({ left: direction * step(), behavior: 'smooth' })

  const onTrackScroll = () => {
    const width = step()
    if (track.current && width) setActive(Math.min(features.length - 1, Math.round(track.current.scrollLeft / width)))
  }

  return (
    <section className="features" id="fitur">
      <div className="container">
        <div className="features-head" data-reveal>
          <h2 className="display">Yang dikerjakan SAKSI</h2>
          <div className="carousel-nav">
            <span className="counter">
              0{active + 1} <em>/ 0{features.length}</em>
            </span>
            <button onClick={() => slide(-1)} aria-label="Fitur sebelumnya" disabled={active === 0}>
              <Arrow dir="left" />
            </button>
            <button onClick={() => slide(1)} aria-label="Fitur berikutnya" disabled={active === features.length - 1}>
              <Arrow />
            </button>
          </div>
        </div>
      </div>
      <div className="feature-track" ref={track} onScroll={onTrackScroll}>
        {features.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} index={i} />
        ))}
      </div>
    </section>
  )
}
