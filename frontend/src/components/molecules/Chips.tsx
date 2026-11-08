'use client'

interface Props<T extends string> { items: { key: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }

export default function Chips<T extends string>({ items, value, onChange }: Props<T>) {
  return (
    <div className="flex flex-wrap gap-6 [&_button]:items-center [&_button]:bg-white [&_button]:border-[0.15rem] [&_button]:border-[#dcdcd8] [&_button]:border-solid [&_button]:rounded-[3rem] [&_button]:[color:inherit] [&_button]:inline-flex [&_button]:text-[1.35rem] [&_button]:gap-8 [&_button]:min-h-38 [&_button]:py-0 [&_button]:px-14 [&_button]:[transition:border-color_0.2s,_background_0.2s,_color_0.2s] [&_button:hover]:border-ink [&_button_span]:text-[1.2rem] [&_button_span]:text-dim d-chips">
      {items.map((i) => (
        <button key={i.key} type="button" className={value === i.key ? '[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on' : ''} aria-pressed={value === i.key} onClick={() => onChange(i.key)}>
          {i.label}
          {i.count !== undefined && <span>{i.count}</span>}
        </button>
      ))}
    </div>
  )
}
