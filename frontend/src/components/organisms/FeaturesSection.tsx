'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Arrow from '@/components/atoms/Arrow'
import FeatureCard from '@/components/molecules/FeatureCard'
import { features } from '@/data/home'

gsap.registerPlugin(ScrollTrigger)

export default function FeaturesSection() {
  const [active, setActive] = useState(0)
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const trigger = useRef<ScrollTrigger | null>(null)

  // Pin the section and turn vertical scroll into horizontal travel until the last card.
  useLayoutEffect(() => {
    const el = track.current!
    const distance = () => el.scrollWidth - el.clientWidth
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Scroll snapping would fight the scrubbed scrollLeft.
      el.style.scrollSnapType = 'none'
      const tween = gsap.to(el, {
        scrollLeft: distance,
        ease: 'none',
        scrollTrigger: {
          // Pin the whole section, but when the cards sit centred on screen, so there is equal room above and below.
          trigger: el,
          pin: section.current,
          start: 'center center',
          end: () => `+=${distance()}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      trigger.current = tween.scrollTrigger ?? null

      return () => {
        trigger.current = null
        el.style.scrollSnapType = ''
      }
    })

    return () => mm.revert()
  }, [])

  const step = () => {
    const card = track.current?.querySelector<HTMLElement>('.feature-card')
    return card ? card.offsetWidth + parseFloat(getComputedStyle(track.current!).columnGap || '0') : 0
  }

  const slide = (direction: number) => {
    const el = track.current
    const st = trigger.current
    if (!el) return
    if (!st) return el.scrollBy({ left: direction * step(), behavior: 'smooth' })
    // While pinned, scrollLeft follows the page scroll, so move the page to where that card sits.
    const max = el.scrollWidth - el.clientWidth
    const left = Math.min(max, Math.max(0, el.scrollLeft + direction * step()))
    window.scrollTo({ top: st.start + (left / max) * (st.end - st.start), behavior: 'smooth' })
  }

  const onTrackScroll = () => {
    const width = step()
    if (track.current && width) setActive(Math.min(features.length - 1, Math.round(track.current.scrollLeft / width)))
  }

  return (
    <section className="features" id="fitur" ref={section}>
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
