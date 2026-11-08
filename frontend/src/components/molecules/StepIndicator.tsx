import Check from '@/components/atoms/Check'

interface Props {
  steps: string[]
  current: number
}

/* Numbered progress for multi-step forms: done steps get a check, the current one is filled */
export default function StepIndicator({ steps, current }: Props) {
  return (
    <ol className="grid gap-8 [grid-auto-columns:1fr] grid-flow-col list-none list-outside mb-28 [&_li]:border-t-[0.3rem] [&_li]:border-t-[#e3e3e0] [&_li]:[border-top-style:solid] [&_li]:flex [&_li]:flex-col [&_li]:text-[1.2rem] [&_li]:gap-6 [&_li]:opacity-[0.55] [&_li]:pt-10 [&_li]:[transition:border-color_0.4s_var(--ease-saksi),_opacity_0.4s] auth-steps" aria-label={`Langkah ${current + 1} dari ${steps.length}`}>
      {steps.map((s, i) => (
        <li key={s} className={i < current ? '[.auth-steps_li&]:border-blue [.auth-steps_li&]:opacity-[1] [.form-steps_li&]:opacity-[1] [.form-steps_li&>span]:bg-blue [.form-steps_li&>span]:border-blue [.form-steps_li&>span]:text-white [.d-wizard-steps_li&]:text-ink [.d-wizard-steps_li&_span]:bg-ink [.d-wizard-steps_li&_span]:border-ink [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-ink! [.d-lifecycle_li&_span]:bg-ink! [.d-lifecycle_li&_span]:border-ink! [.d-lifecycle_li&_span]:text-white! is-done' : i === current ? '[.auth-steps_li&]:border-blue [.auth-steps_li&]:opacity-[1] [.form-steps_li&]:opacity-[1] [.form-steps_li&>span]:bg-ink [.form-steps_li&>span]:text-white [.stepper_li&_button]:bg-white is-current' : ''} aria-current={i === current ? 'step' : undefined}>
          <span className="items-center border-[0.15rem] border-current border-solid rounded-[50%] flex text-[1.2rem] h-26 justify-center w-26 [.is-current_&]:bg-ink [.is-current_&]:border-ink [.is-current_&]:text-white [.is-done_&]:bg-blue [.is-done_&]:border-blue [.is-done_&]:text-white auth-step-no">{i < current ? <Check /> : i + 1}</span>
          <span className="uppercase">{s}</span>
        </li>
      ))}
    </ol>
  )
}
