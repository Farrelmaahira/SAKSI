import { useContext } from 'react'
import { DashContext } from '@/contexts/dash-context'
import type { DashCtx } from '@/interfaces/dash'

/* Signed-in session for dashboard pages; only usable under DashLayout, which renders them after sign-in. */
export function useDash(): DashCtx {
  const ctx = useContext(DashContext)
  if (!ctx) throw new Error('useDash must be used inside DashLayout')
  return ctx
}
