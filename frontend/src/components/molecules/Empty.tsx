import type { ReactNode } from 'react'
import Illustration from '@/components/atoms/Illustration'
import type { IllustrationName } from '@/data/illustrations'

interface Props {
  art?: IllustrationName
  title: string
  text?: string
  action?: ReactNode
}

export default function Empty({ art = 'all-checked_d3u6', title, text, action }: Props) {
  return (
    <div className="items-center grid gap-16 justify-items-start py-10 px-0 [&_img]:max-h-120 [&_img]:w-auto [&>div]:grid [&>div]:gap-6 [&>div]:justify-items-start [&_p:not(.d-empty-title)]:text-[1.4rem] [&_p:not(.d-empty-title)]:text-dim md:grid-cols-[14rem_1fr] d-empty">
      <Illustration name={art} />
      <div>
        <p className="text-[1.9rem] font-[380] d-empty-title">{title}</p>
        {text && <p>{text}</p>}
        {action}
      </div>
    </div>
  )
}
