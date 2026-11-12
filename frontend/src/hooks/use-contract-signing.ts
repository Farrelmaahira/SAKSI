import { useState } from 'react'
import type { Session } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'
import { signContract } from '@/lib/api/sign-contract'
import type { SignKey } from '@/lib/dash/sign-steps'
import { applyMeterai } from '@/lib/db/apply-meterai'
import { sign } from '@/lib/db/sign'

/* Signing a contract: the drawn signature, the server call, and the local copy that follows a confirmed save. */
export function useContractSigning(c: DContract, session: Session) {
  const [image, setImage] = useState<string | null>(null)
  const [signError, setSignError] = useState('')
  const [signing, setSigning] = useState(false)

  // signatures are stored on the server first; the local copy only follows a confirmed save
  const signOnServer = async (who: 'desa' | 'pihak') => {
    if (!c.apiId) return
    setSigning(true)
    setSignError('')
    const res = await signContract(c.apiId, { metode: 'simulasi', referensi: image || `sig_${who === 'desa' ? 'desa' : 'vendor'}_${session.name}` })
    setSigning(false)
    if (!res.ok) return setSignError(`Tanda tangan belum tersimpan. ${res.error}`)
    sign(c.code, who, session, image ?? undefined)
    setImage(null)
  }

  const act = (key: SignKey) => (key === 'meterai' ? applyMeterai(c.code, session) : signOnServer(key))

  return { image, setImage, signing, signError, act }
}
