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
    <section className="bg-blue text-white pt-120 px-0 pb-140 lg:pt-180 lg:px-0 lg:pb-220" id="masalah" ref={root}>
      <div className="my-0 mx-auto py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 max-w-1500 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container" data-reveal>
        <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">Masalahnya</p>
        <p className="text-[3.6rem] font-[300] tracking-[-0.05em] leading-[1.1] md:text-[6rem] lg:text-[8rem] lg:leading-[1.18] brief-text">
          <span
            ref={whiteTextRef}
            className="brief-white"
            style={{ display: 'inline', willChange: 'opacity, transform' }}
          >
            Kontrak yang tidak jelas membuka ruang{' '}
            <span className="inline-block relative [.auth-title_&]:whitespace-nowrap [.page-title_&]:whitespace-nowrap">
              penyimpangan.
              <span ref={loopRef} style={{ display: 'inline-block' }}>
                <Loop className="h-[140%] left-[-8%] absolute top-[-15%] w-[116%]" />
              </span>
            </span>
          </span>{' '}
          <span
            ref={greyTextRef}
            className="[.brief-text_&]:text-[rgba(255,_255,_255,_0.5)] brief-grey"
            style={{ display: 'inline', willChange: 'opacity, transform' }}
          >
            Dana desa terus mengalir, sementara isi perjanjiannya jarang bisa diperiksa.
          </span>
        </p>
      </div>
    </section>
  )
}
