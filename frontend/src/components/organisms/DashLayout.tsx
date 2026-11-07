'use client'

import { useState, type ReactNode } from 'react'
import { useRequireSession } from '@/hooks/use-require-session'
import { ConfirmProvider } from '@/contexts/confirm-context'
import DashShell from './DashShell'

interface Props {
  children: ReactNode
}

/* Gate for every /dashboard page: nothing renders until there is a session, so signed-out visitors never see data. */
export default function DashLayout({ children }: Props) {
  const [leaving, setLeaving] = useState(false)
  const session = useRequireSession(leaving)

  if (!session) return null
  return (
    <ConfirmProvider>
      <DashShell session={session} onLeaving={() => setLeaving(true)}>
        {children}
      </DashShell>
    </ConfirmProvider>
  )
}
