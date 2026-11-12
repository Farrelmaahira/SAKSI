import type { ReactNode } from 'react'
import Icon from '@/components/atoms/Icon'
import { cn } from '@/lib/utils'

interface Props {
  tone: 'mine' | 'waiting' | 'done'
  icon: string
  title: string
  children: ReactNode
  /* the button on the right */
  action?: ReactNode
}

/* The banner at the top of a contract: what comes next, for whom */
export default function NextStepBanner({ tone, icon, title, children, action }: Props) {
  return (
    <div
      className={cn(
        'items-center rounded-[2rem] grid gap-14 grid-cols-[auto_minmax(0,1fr)] p-20 [&_strong]:text-[1.9rem] [&_strong]:font-[400] [&_strong]:leading-[1.3] md:grid-cols-[auto_minmax(0,1fr)_auto] md:py-20 md:px-24 d-next',
        tone === 'mine' && 'bg-blue [box-shadow:0.6rem_0.6rem_0_var(--color-ink)] text-white is-mine',
        tone === 'done' && 'bg-green text-white',
        tone === 'waiting' && 'bg-white',
      )}
    >
      <Icon name={icon} />
      <div>
        <p className="font-hand text-[2.2rem] leading-[1] mb-4">{title}</p>
        <strong>{children}</strong>
      </div>
      {action}
    </div>
  )
}
