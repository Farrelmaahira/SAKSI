import type { CSSProperties } from 'react'
import { logoTones } from '@/data/logo-tones'
import { cn } from '@/lib/utils'
import type { LogoTone } from '@/interfaces/logo'

interface Props {
  tone?: LogoTone
  className?: string
}

const line = { stroke: 'var(--logo-line)', strokeWidth: 14, strokeLinejoin: 'round', strokeLinecap: 'round' } as const

/* SAKSI logo as inline SVG so one file can be white, black or full colour. Same artwork as public/saksi_logo_klasik.svg. */
export default function Logo({ tone = 'color', className }: Props) {
  return (
    <svg className={cn("h-40 w-auto lg:h-50 lg:w-auto [.app-logo_&]:h-34 [.app-logo_&]:w-auto", className)} viewBox="40 40 432 432" aria-hidden="true" style={logoTones[tone] as CSSProperties}>
      <g transform="rotate(-8 245 250)">
        <path d="M150 95 H300 L350 145 V405 H150 Z" fill="var(--logo-paper)" {...line} />
        <path d="M300 95 V145 H350" fill="var(--logo-paper)" {...line} />
        <path d="M190 215.2 L235 172 L280 215.2 V266.5 H190 Z" fill="var(--logo-accent)" {...line} />
        <path d="M217.9 266.5 V235.9 H252.1 V266.5" fill="var(--logo-door-fill)" {...line} stroke="var(--logo-door-line)" />
        <line x1="190" y1="305" x2="310" y2="305" fill="none" {...line} />
        <line x1="230" y1="347" x2="290" y2="347" fill="none" {...line} />
      </g>
      <g transform="translate(318 418) rotate(-50)">
        <path d="M0 -20 H150 V20 H0 Z" fill="var(--logo-accent)" {...line} />
        <path d="M150 -20 H182 Q192 -20 192 -10 V10 Q192 20 182 20 H150 Z" fill="var(--logo-line)" {...line} />
        <path d="M0 -20 L-44 0 L0 20 Z" fill="var(--logo-paper)" {...line} />
        <path d="M-26 -8.2 L-44 0 L-26 8.2 Z" fill="var(--logo-line)" {...line} strokeWidth={6} />
      </g>
      <path
        d="M154.05 332.78 Q160.00 328.00 165.95 332.78 Q171.91 337.57 179.45 336.40 Q187.00 335.23 189.76 342.35 Q192.53 349.47 199.65 352.24 Q206.77 355.00 205.60 362.55 Q204.43 370.09 209.22 376.05 Q214.00 382.00 209.22 387.95 Q204.43 393.91 205.60 401.45 Q206.77 409.00 199.65 411.76 Q192.53 414.53 189.76 421.65 Q187.00 428.77 179.45 427.60 Q171.91 426.43 165.95 431.22 Q160.00 436.00 154.05 431.22 Q148.09 426.43 140.55 427.60 Q133.00 428.77 130.24 421.65 Q127.47 414.53 120.35 411.76 Q113.23 409.00 114.40 401.45 Q115.57 393.91 110.78 387.95 Q106.00 382.00 110.78 376.05 Q115.57 370.09 114.40 362.55 Q113.23 355.00 120.35 352.24 Q127.47 349.47 130.24 342.35 Q133.00 335.23 140.55 336.40 Q148.09 337.57 154.05 332.78 Z"
        fill="var(--logo-line)"
        {...line}
        strokeWidth={10}
      />
      <path d="M139 383 L154 398 L182 368" fill="none" stroke="var(--logo-check)" strokeWidth={13} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
