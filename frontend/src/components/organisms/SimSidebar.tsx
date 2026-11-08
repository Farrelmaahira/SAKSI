import Check from '@/components/atoms/Check'
import { steps } from '@/data/simulator'
import { cn } from '@/lib/utils'

interface Props {
  step: number
  done: boolean[]
  onStep: (step: number) => void
}

export default function SimSidebar({ step, done, onStep }: Props) {
  return (
    <aside className="bg-soft rounded-[2rem] p-20 lg:p-24 lg:sticky lg:top-30">
      <div className="bg-white rounded-[1rem] h-6 mb-20 overflow-hidden [&_span]:bg-blue [&_span]:block [&_span]:h-full [&_span]:[transition:width_0.6s_var(--ease-saksi)]" aria-hidden="true">
        <span style={{ width: `${(done.filter(Boolean).length / steps.length) * 100}%` }} />
      </div>
      <ol className="grid gap-6 [grid-auto-columns:24rem] grid-flow-col list-none list-outside overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&_button]:items-center [&_button]:bg-transparent [&_button]:border-0 [&_button]:border-none [&_button]:rounded-[1.4rem] [&_button]:[color:inherit] [&_button]:flex [&_button]:gap-14 [&_button]:p-12 [&_button]:text-left [&_button]:[transition:background_0.3s] [&_button]:w-full [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-[0.4] [&_button:hover:not(:disabled)]:bg-[rgba(255,_255,_255,_0.6)] lg:grid-flow-row lg:overflow-visible stepper">
        {steps.map((s, i) => (
          <li key={s.title} className={cn(i === step && '[.auth-steps_li&]:border-blue [.auth-steps_li&]:opacity-[1] [.form-steps_li&]:opacity-[1] [.form-steps_li&>span]:bg-ink [.form-steps_li&>span]:text-white [.stepper_li&_button]:bg-white is-current', done[i] && '[.auth-steps_li&]:border-blue [.auth-steps_li&]:opacity-[1] [.form-steps_li&]:opacity-[1] [.form-steps_li&>span]:bg-blue [.form-steps_li&>span]:border-blue [.form-steps_li&>span]:text-white [.d-wizard-steps_li&]:text-ink [.d-wizard-steps_li&_span]:bg-ink [.d-wizard-steps_li&_span]:border-ink [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-ink! [.d-lifecycle_li&_span]:bg-ink! [.d-lifecycle_li&_span]:border-ink! [.d-lifecycle_li&_span]:text-white! is-done')}>
            <button type="button" disabled={!done.slice(0, i).every(Boolean)} onClick={() => onStep(i)} aria-current={i === step ? 'step' : undefined}>
              <span className="items-center border-[0.1rem] border-ink border-solid rounded-[50%] flex flex-none text-[1.3rem] h-40 justify-center w-40 [.is-current_&]:bg-ink [.is-current_&]:text-white [.is-done_&]:bg-blue [.is-done_&]:border-blue [.is-done_&]:text-white">{done[i] ? <Check /> : `0${i + 1}`}</span>
              <span className="[&_strong]:block [&_strong]:text-[1.6rem] [&_strong]:font-[400] [&_small]:text-[1.3rem] [&_small]:opacity-[0.65]">
                <strong>{s.title}</strong>
                <small>{s.short}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <aside className="bg-white rounded-[1.4rem] mt-16 p-20 [&_p:last-child]:text-[1.5rem] [&_p:last-child]:leading-[1.5]">
        <p className="text-blue text-[1.2rem] mb-8 uppercase">Kenapa penting?</p>
        <p>{steps[step].why}</p>
      </aside>
    </aside>
  )
}
