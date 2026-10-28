import { cn } from '@/lib/utils'
import type { DoodleProps } from '@/interfaces/doodle'

/* Hand drawn marks. Paths are deliberately uneven so they read as pen strokes. */
export default function Underline({ className }: DoodleProps) {
  return (
    <svg className={cn('doodle', className)} viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden="true">
      <path d="M4 18c38-7 81-11 126-9 44 2 93 1 140-6 8-1 16-1 24 1M38 24c52-6 110-7 170-5" />
    </svg>
  )
}
