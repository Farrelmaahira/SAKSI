import Check from '@/components/atoms/Check'
import { steps } from '@/data/simulator'
import { cn } from '@/lib/utils'

export interface SimSidebarProps {
  step: number
  done: boolean[]
  onStep: (step: number) => void
}

export default function SimSidebar({ step, done, onStep }: SimSidebarProps) {
  return (
    <aside className="sim-side">
      <div className="sim-progress" aria-hidden="true">
        <span style={{ width: `${(done.filter(Boolean).length / steps.length) * 100}%` }} />
      </div>
      <ol className="stepper">
        {steps.map((s, i) => (
          <li key={s.title} className={cn(i === step && 'is-current', done[i] && 'is-done')}>
            <button type="button" disabled={!done.slice(0, i).every(Boolean)} onClick={() => onStep(i)} aria-current={i === step ? 'step' : undefined}>
              <span className="step-no">{done[i] ? <Check /> : `0${i + 1}`}</span>
              <span className="step-text">
                <strong>{s.title}</strong>
                <small>{s.short}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <aside className="sim-why">
        <p className="why-label">Kenapa penting?</p>
        <p>{steps[step].why}</p>
      </aside>
    </aside>
  )
}
