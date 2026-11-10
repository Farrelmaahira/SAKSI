import Icon from '@/components/atoms/Icon'
import { cn } from '@/lib/utils'

interface Props {
  steps: string[]
  current: number
}

/* Numbered steps of a dashboard wizard; on phones only the current step keeps its label */
export default function WizardSteps({ steps, current }: Props) {
  return (
    <ol className="flex gap-6 list-none list-outside -mb-4 overflow-x-auto pb-4" aria-label="Langkah">
      {steps.map((s, i) => {
        const done = i < current
        const on = i === current
        return (
          <li key={s} className={cn('items-center flex flex-none text-[1.35rem] gap-8 pr-14', on ? 'text-blue' : done ? 'text-ink' : 'text-dim', !on && 'max-md:[font-size:0] max-md:gap-0 max-md:pr-0')} aria-current={on ? 'step' : undefined}>
            <span className={cn('items-center border-[0.15rem] border-solid rounded-[50%] flex text-[1.25rem] h-30 justify-center w-30', on ? 'bg-blue border-blue text-white [box-shadow:0.2rem_0.2rem_0_var(--color-ink)]' : done ? 'bg-ink border-ink text-white' : 'border-current')}>
              {done ? <Icon name="check" /> : i + 1}
            </span>
            {s}
          </li>
        )
      })}
    </ol>
  )
}
