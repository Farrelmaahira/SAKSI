import { useState } from 'react'
import type { Meterai, Signature } from '@/interfaces/db'
import { nowIso } from '@/lib/dates/now-iso'
import { newMeteraiSerial } from '@/lib/db/new-meterai-serial'

/* Letter date, the village head's drawn signature and the e-meterai of the review step. */
export function useLetterSigning(signer: string) {
  const [date, setDate] = useState('')
  const [signature, setSignature] = useState<Signature | null>(null)
  const [meterai, setMeterai] = useState<Meterai | null>(null)

  // Clearing the signature also clears the meterai: a stamp on an unsigned letter means nothing.
  const draw = (image: string | null) => {
    setSignature(image ? { by: signer, at: nowIso(), image } : null)
    if (!image) setMeterai(null)
  }

  return {
    date,
    signature,
    meterai,
    draw,
    stamp: () => setMeterai({ serial: newMeteraiSerial(), at: nowIso() }),
    stampDate: () => setDate(nowIso()),
    signatures: signature ? { desa: signature, ...(meterai ? { meterai } : {}) } : undefined,
  }
}
