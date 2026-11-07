import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function FormAlert({ children }: Props) {
  return (
    <p className="auth-alert" role="alert">
      {children}
    </p>
  )
}
