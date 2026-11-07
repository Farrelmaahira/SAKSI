import { useContext } from 'react'
import { ConfirmContext, type Ask } from '@/contexts/confirm-context'

/* `if (await confirm({ title, text, confirmLabel })) doIt()`; only usable inside DashLayout */
export function useConfirm(): Ask {
  const ask = useContext(ConfirmContext)
  if (!ask) throw new Error('useConfirm must be used inside DashLayout')
  return ask
}
