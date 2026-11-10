import type { ReactNode } from 'react'
import Icon from '@/components/atoms/Icon'
import { cn } from '@/lib/utils'

interface Props {
  tone: 'green' | 'red'
  icon: string
  children: ReactNode
  className?: string
}

// d-ok and d-callout are the markers Icon uses to nudge its own position
const TONES = { green: 'bg-green d-ok', red: 'bg-red d-callout' }

/* Filled notice box with an icon, e.g. a privacy note or a warning */
export default function Callout({ tone, icon, children, className }: Props) {
  return (
    <p className={cn('items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 text-white', TONES[tone], className)}>
      <Icon name={icon} />
      {children}
    </p>
  )
}
