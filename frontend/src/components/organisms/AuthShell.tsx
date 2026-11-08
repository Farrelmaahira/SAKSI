import type { ReactNode } from 'react'
import HeroBg from '@/components/atoms/HeroBg'
import Underline from '@/components/atoms/Underline'
import AuthPoints from '@/components/molecules/AuthPoints'

interface Props {
  label: string
  title: string
  mark: string
  lead: string
  points: string[]
  children: ReactNode
}

/* Shared frame for the auth pages: photo hero on the left, white form card on the right */
export default function AuthShell({ label, title, mark, lead, points, children }: Props) {
  return (
    <main className="bg-blue text-white min-h-svh overflow-hidden pt-130 px-0 pb-80 relative lg:pt-160 lg:px-0 lg:pb-100 auth">
      <HeroBg />
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 items-center grid gap-40 grid-cols-[minmax(0,1fr)] lg:gap-100 lg:grid-cols-[minmax(0,1fr)_52rem] [.page-hero>&]:relative [.page-hero>&]:z-1 container">
        <div className="auth-intro">
          <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">{label}</p>
          <h1 className="text-[5rem] font-[320] tracking-[-0.04em] leading-[1] mb-30 md:text-[7rem] lg:text-[clamp(6.4rem,_6vw,_9.6rem)] auth-title">
            {title}{' '}
            <span className="inline-block relative [.auth-title_&]:whitespace-nowrap [.page-title_&]:whitespace-nowrap">
              {mark}
              <Underline className="bottom-[-0.12em] h-[0.28em] left-[-2%] absolute w-[104%]" />
            </span>
          </h1>
          <p className="text-[rgba(255,_255,_255,_0.85)] text-[1.8rem] leading-[1.5] mb-40 max-w-560 md:text-[2rem]">{lead}</p>
          <AuthPoints points={points} />
        </div>
        <div className="bg-white rounded-[2rem] [box-shadow:1rem_1rem_0_var(--color-ink)] text-ink min-w-0 py-30 px-24 md:p-44 auth-card">{children}</div>
      </div>
    </main>
  )
}
