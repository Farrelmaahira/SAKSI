'use client'

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Loop from '@/components/atoms/Loop'

gsap.registerPlugin(ScrollTrigger)

export default function BriefSection() {
  const root = useRef<HTMLElement>(null)
  const whiteTextRef = useRef<HTMLSpanElement>(null)
  const greyTextRef = useRef<HTMLSpanElement>(null)
  const loopRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top 75%',
            once: true,
          },
        })

        tl.fromTo(
          whiteTextRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        )
          .fromTo(
            loopRef.current,
            { opacity: 0, scale: 0.85 },
            { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.5)' },
            '-=0.3',
          )
          .fromTo(
            greyTextRef.current,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
            '-=0.2',
          )
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        if (whiteTextRef.current) whiteTextRef.current.style.opacity = '1'
        if (greyTextRef.current) greyTextRef.current.style.opacity = '1'
        if (loopRef.current) loopRef.current.style.opacity = '1'
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section className="brief" id="masalah" ref={root}>
      <div className="container narrow" data-reveal>
        <p className="label">Masalahnya</p>
        <p className="brief-text">
          <span
            ref={whiteTextRef}
            className="brief-white"
            style={{ display: 'inline', willChange: 'opacity, transform' }}
          >
            Kontrak yang tidak jelas membuka ruang{' '}
            <span className="marked">
              penyimpangan.
              <span ref={loopRef} style={{ display: 'inline-block' }}>
                <Loop className="brief-loop" />
              </span>
            </span>
          </span>{' '}
          <span
            ref={greyTextRef}
            className="dim brief-grey"
            style={{ display: 'inline', willChange: 'opacity, transform' }}
          >
            Dana desa terus mengalir, sementara isi perjanjiannya jarang bisa diperiksa.
          </span>
        </p>
      </div>
    </section>
  )
}
