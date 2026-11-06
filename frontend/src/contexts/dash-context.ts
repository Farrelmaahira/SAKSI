import { createContext } from 'react'
import type { DashCtx } from '@/interfaces/dash'

export const DashContext = createContext<DashCtx | null>(null)
