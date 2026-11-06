import Check from '@/components/atoms/Check'

interface Props {
  steps: string[]
  current: number
}

/* Numbered progress for multi-step forms: done steps get a check, the current one is filled */
export default function StepIndicator({ steps, current }: Props) {
  return (
    <ol className="auth-steps" aria-label={`Langkah ${current + 1} dari ${steps.length}`}>
      {steps.map((s, i) => (
        <li key={s} className={i < current ? 'is-done' : i === current ? 'is-current' : ''} aria-current={i === current ? 'step' : undefined}>
          <span className="auth-step-no">{i < current ? <Check /> : i + 1}</span>
          <span className="auth-step-label">{s}</span>
        </li>
      ))}
    </ol>
  )
}
