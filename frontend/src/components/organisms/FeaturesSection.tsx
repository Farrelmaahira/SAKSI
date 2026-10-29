'use client'

import { useState, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Arrow from '@/components/atoms/Arrow'
import FeatureCard from '@/components/molecules/FeatureCard'
import { features } from '@/data/home'

gsap.registerPlugin(ScrollTrigger)

export default function FeaturesSection() {
  const [active, setActive] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const stInstance = useRef<ScrollTrigger | null>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(min-width: 992px)', () => {
        const track = trackRef.current
        const wrap = wrapRef.current
        if (!track || !wrap) return

        // Hitung jarak geser horizontal agar kartu terakhir (ke-5) berhenti pas di ujung kanan layar
        const getDistance = () => {
          return track.scrollWidth - window.innerWidth + 140
        }

        const tween = gsap.to(track, {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: wrap,
            start: 'top top',
            end: () => `+=${Math.max(window.innerHeight * 2, getDistance() * 1.4)}`,
            pin: true,
            scrub: 1.2, // GSAP physics smooth scrub lerp
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Hitung index aktif dari progress scroll 0 s.d. 1
              const cardIdx = Math.min(
                features.length - 1,
                Math.max(0, Math.floor(self.progress * features.length * 0.999))
              )
              setActive(cardIdx)
            },
          },
        })

        stInstance.current = tween.scrollTrigger ?? null
      })
    }, wrapRef)

    return () => ctx.revert()
  }, [])

  // Fungsi navigasi tombol panah kiri / kanan
  const goToCard = (index: number) => {
    const clamped = Math.max(0, Math.min(features.length - 1, index))
    setActive(clamped)

    const st = stInstance.current
    if (st && window.innerWidth >= 992) {
      const targetRatio = clamped / (features.length - 1)
      const targetScroll = st.start + targetRatio * (st.end - st.start)
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      })
    } else if (trackRef.current) {
      const card = trackRef.current.children[clamped] as HTMLElement
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
    }
  }

  return (
    <section className="features" id="fitur" ref={wrapRef}>
      <div className="features-inner">
        <div className="container">
          <div className="features-head" data-reveal>
            <h2 className="display">Yang dikerjakan SAKSI</h2>
            <div className="carousel-nav">
              <span className="counter">
                0{active + 1} <em>/ 0{features.length}</em>
              </span>
              <button
                onClick={() => goToCard(active - 1)}
                aria-label="Fitur sebelumnya"
                disabled={active === 0}
              >
                <Arrow dir="left" />
              </button>
              <button
                onClick={() => goToCard(active + 1)}
                aria-label="Fitur berikutnya"
                disabled={active === features.length - 1}
              >
                <Arrow />
              </button>
            </div>
          </div>
        </div>

        <div className="feature-track-viewport">
          <div className="feature-track" ref={trackRef}>
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
