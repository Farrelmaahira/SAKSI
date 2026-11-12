import { ReactNode } from 'react'
import Icon from '@/components/atoms/Icon'
import Link from 'next/link'

interface Props { label: string; value: ReactNode; hint?: string; tone?: 'blue' | 'red' | 'ink'; to?: string; icon?: string; /* false keeps a long text at full size instead of shrinking it */ shrink?: boolean }

export default function Stat({ label, value, hint, tone = 'blue', to, icon, shrink = true }: Props) {
  const body = (
    <>
      <div className="items-start flex text-[1.3rem] gap-10 justify-between leading-[1.3] text-dim">
        <span>{label}</span>
        {icon && <Icon name={icon} />}
      </div>
      <strong data-long={shrink && typeof value === 'string' && value.length > 7 ? '' : undefined}>{value}</strong>
      {hint && <small>{hint}</small>}
    </>
  )
  return to ? (
    <Link className={`bg-white rounded-[1.8rem] grid gap-6 grid-rows-[minmax(3.4rem,auto)_auto_1fr] min-w-0 py-16 px-18 [transition:box-shadow_0.25s,_transform_0.25s] [a&:hover]:[box-shadow:0.5rem_0.5rem_0_var(--color-blue)] [a&:hover]:[transform:translate(-0.2rem,_-0.2rem)] [&_strong]:text-[3.4rem] [&_strong]:font-[320] [&_strong]:tracking-[-0.03em] [&_strong]:leading-[1] [&_strong]:wrap-anywhere [&.tone-blue_strong]:text-blue [&.tone-red_strong]:text-red! [&_small]:[align-self:end] [&_small]:text-[1.25rem] [&_small]:text-dim max-lg:[&_strong[data-long]]:text-[2rem] max-lg:[&_strong[data-long]]:[overflow-wrap:normal] max-lg:[&_strong[data-long]]:whitespace-nowrap md:max-lg:[&_strong[data-long]]:text-[2.6rem] max-md:[.d-stats>&:last-child:nth-child(odd)]:[grid-column:span_2] tone-${tone}`} href={to}>
      {body}
    </Link>
  ) : (
    <div className={`bg-white rounded-[1.8rem] grid gap-6 grid-rows-[minmax(3.4rem,auto)_auto_1fr] min-w-0 py-16 px-18 [transition:box-shadow_0.25s,_transform_0.25s] [a&:hover]:[box-shadow:0.5rem_0.5rem_0_var(--color-blue)] [a&:hover]:[transform:translate(-0.2rem,_-0.2rem)] [&_strong]:text-[3.4rem] [&_strong]:font-[320] [&_strong]:tracking-[-0.03em] [&_strong]:leading-[1] [&_strong]:wrap-anywhere [&.tone-blue_strong]:text-blue [&.tone-red_strong]:text-red! [&_small]:[align-self:end] [&_small]:text-[1.25rem] [&_small]:text-dim max-lg:[&_strong[data-long]]:text-[2rem] max-lg:[&_strong[data-long]]:[overflow-wrap:normal] max-lg:[&_strong[data-long]]:whitespace-nowrap md:max-lg:[&_strong[data-long]]:text-[2.6rem] max-md:[.d-stats>&:last-child:nth-child(odd)]:[grid-column:span_2] tone-${tone}`}>{body}</div>
  )
}
