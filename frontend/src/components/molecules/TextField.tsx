import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export default function TextField({ label, error, hint, id, ...input }: Props) {
  const msgId = `${id}-msg`
  return (
    <div className={cn('auth-field', error && 'has-error')}>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={error || hint ? msgId : undefined} {...input} />
      {(error || hint) && (
        <p id={msgId} className={error ? 'auth-error' : 'auth-hint'}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
