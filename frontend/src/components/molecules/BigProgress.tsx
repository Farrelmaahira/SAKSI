import type { ReactNode } from 'react'
import Bar from '@/components/atoms/Bar'

interface Props {
  label: string
  value: ReactNode
  /* 0 to 100 */
  percent: number
  tone?: 'blue' | 'red'
}

/* A label with a big number and a bar under it */
export default function BigProgress({ label, value, percent, tone }: Props) {
  return (
    <div className="grid gap-8 [&>div:first-child]:items-baseline [&>div:first-child]:flex [&>div:first-child]:justify-between [&_span]:text-[1.35rem] [&_span]:text-dim [&_strong]:text-[2.6rem]! [&_strong]:font-[320] [&_strong_small]:text-[1.3rem] [&_strong_small]:text-dim d-big-progress">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <Bar value={percent} tone={tone} />
    </div>
  )
}
