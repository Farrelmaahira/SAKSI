'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Session } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'
import { useConfirm } from '@/hooks/use-confirm'
import { cancelContract } from '@/lib/api/cancel-contract'
import { update } from '@/lib/db/update'
import { withStatus } from '@/lib/db/with-status'
import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'

interface Props { c: DContract; session: Session }

/* Cancel a contract that is still a draft (DELETE /contracts/{id}). Only the village, only server contracts, only before signing. */
export default function CancelContractButton({ c, session }: Props) {
  const confirm = useConfirm()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (session.role.role !== 'perangkat_desa' || !c.apiId || (c.status !== 'draf' && c.status !== 'diaudit')) return null

  const run = async () => {
    const ok = await confirm({
      title: 'Batalkan kontrak ini?',
      text: 'Kontrak tidak bisa diedit atau ditandatangani lagi.',
      confirmLabel: 'Ya, batalkan kontrak',
      cancelLabel: 'Tidak jadi',
      tone: 'danger',
    })
    if (!ok || !c.apiId) return
    setBusy(true)
    setError('')
    const r = await cancelContract(c.apiId)
    setBusy(false)
    if (!r.ok) return setError(r.error)
    // the local copy only follows the confirmed server change
    update(c.code, (x) => withStatus(x, 'dibatalkan', session.name))
    router.push('/dashboard/kontrak')
  }

  return (
    <div className="grid gap-8 justify-items-end">
      <Btn variant="danger" icon="close" onClick={run} disabled={busy}>
        {busy ? 'Membatalkan…' : 'Batalkan kontrak'}
      </Btn>
      {error && <FormAlert>{error}</FormAlert>}
    </div>
  )
}
