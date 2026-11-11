import { useState } from 'react'
import { signItems, unsigned } from '@/data/simulator'
import type { SignedState } from '@/interfaces/simulator'

/* Step 3 of the simulator: signatures and the e-meterai dropped on their boxes. */
export function useSimSign() {
  const [signed, setSigned] = useState<SignedState>(unsigned)
  const [message, setMessage] = useState<string | null>(null)

  const place = (id: string, zone: string) => {
    const item = signItems.find((s) => s.id === id)
    if (!item) return
    if (item.zone !== zone) return setMessage('Kotak itu untuk pihak lain. Coba seret ke kotak yang sesuai namanya.')
    setMessage(null)
    setSigned((s) => ({ ...s, [item.key]: true }))
  }

  const reset = () => {
    setSigned(unsigned)
    setMessage(null)
  }

  return { signed, message, place, reset, all: signed.kades && signed.meterai && signed.penyedia }
}
