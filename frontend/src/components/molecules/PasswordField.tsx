'use client'

import { useState, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export default function PasswordField({ label, error, hint, id, ...input }: Props) {
  const [show, setShow] = useState(false)
  const msgId = `${id}-msg`
  return (
    <div className={cn('auth-field', error && 'has-error')}>
      <label htmlFor={id}>{label}</label>
      <div className="auth-password">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? msgId : undefined}
          {...input}
        />
        <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show}>
          {show ? 'Sembunyikan' : 'Lihat'}
        </button>
      </div>
      {(error || hint) && (
        <p id={msgId} className={error ? 'auth-error' : 'auth-hint'}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
