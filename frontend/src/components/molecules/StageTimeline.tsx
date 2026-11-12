import Icon from '@/components/atoms/Icon'
import { statusLabels, statusOrder } from '@/data/db'
import type { DContract } from '@/interfaces/db'
import { fmtDate } from '@/lib/dates/fmt-date'
import { cn } from '@/lib/utils'

/* The seven stages of a contract; done ones are dark, the current one is blue, each with the date it was reached */
export default function StageTimeline({ c }: { c: DContract }) {
  const at = statusOrder.indexOf(c.status)
  return (
    <ol className="grid gap-6 grid-cols-[repeat(7,minmax(9rem,1fr))] list-none list-outside overflow-x-auto pb-4 [&_li]:grid [&_li]:gap-4 [&_li]:justify-items-start [&_li]:relative [&_li::after]:bg-line [&_li::after]:content-[''] [&_li::after]:h-1.5 [&_li::after]:left-36 [&_li::after]:absolute [&_li::after]:right-6 [&_li::after]:top-15 [&_li:last-child::after]:hidden [&_span]:items-center [&_span]:border-[0.15rem] [&_span]:border-current [&_span]:border-solid [&_span]:rounded-[50%] [&_span]:flex! [&_span]:text-[1.2rem] [&_span]:h-30 [&_span]:justify-center [&_span]:w-30 [&_strong]:text-[1.35rem]! [&_strong]:font-[420] [&_small]:text-[1.15rem]! max-md:gap-0 max-md:grid-cols-[1fr] max-md:overflow-visible max-md:pb-0 max-md:[&_li]:items-center max-md:[&_li]:gap-x-12 max-md:[&_li]:grid-cols-[3rem_minmax(0,1fr)_auto] max-md:[&_li]:py-6 max-md:[&_li]:px-0 max-md:[&_li::after]:bottom-0 max-md:[&_li::after]:h-auto max-md:[&_li::after]:left-14.25 max-md:[&_li::after]:right-auto max-md:[&_li::after]:top-36 max-md:[&_li::after]:w-1.5">
      {statusOrder.map((s, i) => {
        const h = [...c.history].reverse().find((x) => x.status === s)
        const done = i < at
        const now = i === at
        return (
          <li key={s} className={cn(done && 'text-ink [&_span]:bg-ink [&_span]:border-ink! [&_span]:text-white', now && 'text-blue [&_span]:bg-blue [&_span]:border-blue! [&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [&_span]:text-white', !done && !now && 'text-dim')}>
            <span>{done || (now && s === 'selesai') ? <Icon name="check" /> : i + 1}</span>
            <strong>{statusLabels[s]}</strong>
            <small>{h ? fmtDate(h.at) : '-'}</small>
          </li>
        )
      })}
    </ol>
  )
}
