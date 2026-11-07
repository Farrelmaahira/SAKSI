import type { ReactNode } from 'react'
import HeroBg from '@/components/atoms/HeroBg'
import Underline from '@/components/atoms/Underline'
import AuthPoints from '@/components/molecules/AuthPoints'

interface Props {
  label: string
  title: string
  mark: string
  lead: string
  points: string[]
  children: ReactNode
}

/* Shared frame for the auth pages: photo hero on the left, white form card on the right */
export default function AuthShell({ label, title, mark, lead, points, children }: Props) {
  return (
    <main className="auth">
      <HeroBg />
      <div className="container auth-grid">
        <div className="auth-intro">
          <p className="label">{label}</p>
          <h1 className="auth-title">
            {title}{' '}
            <span className="marked">
              {mark}
              <Underline className="hero-underline" />
            </span>
          </h1>
          <p className="page-lead">{lead}</p>
          <AuthPoints points={points} />
        </div>
        <div className="auth-card">{children}</div>
      </div>
    </main>
  )
}
