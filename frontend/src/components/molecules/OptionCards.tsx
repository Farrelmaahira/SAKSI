import { cn } from '@/lib/utils'

interface Option<T extends string> {
  value: T
  label: string
  hint: string
}

interface Props<T extends string> {
  legend: string
  options: Option<T>[]
  value: T | null
  onChange: (v: T) => void
  error?: string
}

/* Compact radio cards, e.g. the type of business on the register form */
export default function OptionCards<T extends string>({ legend, options, value, onChange, error }: Props<T>) {
  return (
    <fieldset className="border-0 border-none grid gap-8 [&_legend]:text-[1.3rem] [&_legend]:mb-8 [&_legend]:opacity-[0.7] [&_legend]:uppercase">
      <legend>{legend}</legend>
      <div className="grid gap-8 grid-cols-[repeat(2,minmax(0,1fr))]">
        {options.map((o) => (
          <label key={o.value} className={cn('border-[0.15rem] border-[#d6d6d2] border-solid rounded-[1.2rem] cursor-pointer grid gap-2 py-12 px-14 relative [transition:border-color_0.2s,_box-shadow_0.2s] [&:hover]:border-ink [&_input]:h-[1px] [&_input]:opacity-[0] [&_input]:pointer-events-none [&_input]:absolute [&_input]:w-[1px] [&_strong]:text-[1.5rem] [&_strong]:font-[400] [&_small]:text-[1.2rem] [&_small]:leading-[1.35] [&_small]:opacity-[0.6] [&.is-on]:border-blue [&.is-on]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&:has(input:focus-visible)]:[outline:0.2rem_solid_var(--color-blue)] [&:has(input:focus-visible)]:[outline-offset:0.2rem]', value === o.value && '[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on')}>
            <input type="radio" name={legend} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <strong>{o.label}</strong>
            <small>{o.hint}</small>
          </label>
        ))}
      </div>
      {error && <p className="text-red text-[1.4rem] leading-[1.4]">{error}</p>}
    </fieldset>
  )
}
