import Check from '@/components/atoms/Check'
import { cn } from '@/lib/utils'

interface Props {
  steps: string[]
  current: number
}

/* Numbered steps of the public report form; done steps are blue with a check, the current one is dark */
export default function ReportStepper({ steps, current }: Props) {
  return (
    <ol className="flex flex-wrap gap-y-10 gap-x-20 list-none list-outside mb-30">
      {steps.map((s, i) => (
        <li key={s} className={cn('items-center flex text-[1.4rem] gap-8', i <= current ? 'opacity-100' : 'opacity-50')}>
          <span className={cn('items-center border-[0.15rem] border-solid rounded-[50%] flex text-[1.2rem] h-30 justify-center w-30', i < current ? 'bg-blue border-blue text-white' : i === current ? 'bg-ink border-ink text-white' : 'border-ink')}>
            {i < current ? <Check /> : i + 1}
          </span>
          {s}
        </li>
      ))}
    </ol>
  )
}
