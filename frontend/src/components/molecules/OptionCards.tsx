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
    <fieldset className="option-cards">
      <legend>{legend}</legend>
      <div className="option-grid">
        {options.map((o) => (
          <label key={o.value} className={cn('option-card', value === o.value && 'is-on')}>
            <input type="radio" name={legend} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <strong>{o.label}</strong>
            <small>{o.hint}</small>
          </label>
        ))}
      </div>
      {error && <p className="auth-error">{error}</p>}
    </fieldset>
  )
}
