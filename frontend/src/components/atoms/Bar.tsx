interface Props { value: number; tone?: 'blue' | 'red' }

export default function Bar({ value, tone = 'blue' }: Props) {
  return (
    <div className={`bg-line rounded-[1rem] flex-1 h-8 min-w-60 overflow-hidden [&_span]:bg-blue [&_span]:[border-radius:inherit] [&_span]:block [&_span]:h-full [&_span]:[transition:width_0.6s_var(--ease-saksi)] [&.tone-red_span]:bg-red [.d-big-progress_&]:h-10 tone-${tone}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}
