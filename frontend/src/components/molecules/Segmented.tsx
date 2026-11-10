import { cn } from '@/lib/utils'

interface Props<T extends string> {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}

/* Pill-shaped switch between a few options, e.g. "Sekaligus" or "Termin" */
export default function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <div className="[align-self:start] bg-soft rounded-[3rem] grid gap-4 [grid-auto-columns:1fr] grid-flow-col p-4">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={cn('border-0 border-none rounded-[3rem] [color:inherit] text-[1.4rem] min-h-40 py-0 px-20 [transition:background_0.2s]', value === o ? 'bg-white [box-shadow:0_0_0_0.15rem_var(--color-ink)]' : '[background:none]')}
          aria-pressed={value === o}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  )
}
