import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  onClick: () => void
  /* inherit = same colour as the text around it, e.g. inside a coloured callout */
  tone?: 'blue' | 'inherit'
}

/* Small underlined button that reads like a link */
export default function TextButton({ children, onClick, tone = 'blue' }: Props) {
  return (
    <button
      type="button"
      className={cn('[background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-[1.3rem] p-0 whitespace-nowrap [&:hover]:text-ink', tone === 'blue' ? 'text-blue' : '[color:inherit]')}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
