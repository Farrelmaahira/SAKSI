'use client'

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ScopeFolder from '@/components/molecules/ScopeFolder'
import { scopeFolders } from '@/data/scope-folders'

gsap.registerPlugin(ScrollTrigger)

export default function ScopeFolders() {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray<HTMLElement>('.folder')

        items.forEach((folder, i) => {
          const next = items[i + 1]

          // Push the folder back and dim it while the next one slides over it.
          if (next) {
            // Explicit start values: tweening from `filter: none` would begin at brightness(0).
            gsap.fromTo(
              folder.querySelector('.folder-sheet'),
              { scale: 1, y: 0, filter: 'brightness(1)' },
              {
                scale: 0.95,
                // Sink slightly so the folder's top edge hides behind the one in front.
                y: '1.4rem',
                filter: 'brightness(0.72)',
                transformOrigin: 'center top',
                ease: 'none',
                scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true },
              },
            )
          } else {
            // Last folder (04): as it docks, it sinks & shrinks into the deck just like 01-03
            gsap.fromTo(
              folder.querySelector('.folder-sheet'),
              { scale: 1, y: 0 },
              {
                scale: 0.95,
                y: '1.4rem',
                transformOrigin: 'center top',
                ease: 'none',
                scrollTrigger: {
                  trigger: folder,
                  start: 'top 20%',
                  end: 'top 11rem',
                  scrub: true,
                },
              },
            )
          }

          // AI recommendation writes the missing clause into the draft.
          const typed = folder.querySelector<HTMLElement>('.typed')!
          const full = typed.dataset.text ?? ''
          typed.textContent = ''
          const proxy = { n: 0 }

          const tl = gsap.timeline({ paused: true })
          tl.from(folder.querySelectorAll('.doc-bar'), { scaleX: 0, transformOrigin: 'left center', duration: 0.5, stagger: 0.05, ease: 'power2.out' })
            .from(folder.querySelector('.ai-card'), { y: 24, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.1')
            .to(folder.querySelector('.ai-apply'), { backgroundColor: '#0f0f17', color: '#ffffff', duration: 0.2 })
            .add(() => folder.querySelector('.doc-typed')?.classList.add('is-writing'))
            .fromTo(folder.querySelector('.margin-mark path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: 'power1.inOut' })
            .to(proxy, {
              n: full.length,
              duration: full.length * 0.028,
              ease: 'none',
              onUpdate: () => {
                typed.textContent = full.slice(0, Math.round(proxy.n))
              },
            })
            .add(() => {
              folder.querySelector('.doc-typed')?.classList.remove('is-writing')
              folder.querySelector('.doc-status')?.classList.add('is-done')
            })

          ScrollTrigger.create({ trigger: folder, start: 'top 60%', once: true, onEnter: () => tl.play() })
        })
      })

      // Without motion everything is shown in its finished state.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.utils.toArray<HTMLElement>('.folder .doc-status').forEach((el) => el.classList.add('is-done'))
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div className="folders" ref={root}>
      {scopeFolders.map((f, i) => (
        <ScopeFolder key={f.title} folder={f} index={i} />
      ))}
    </div>
  )
}
