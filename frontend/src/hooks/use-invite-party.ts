import { useState } from 'react'
import type { Session } from '@/interfaces/auth'
import type { InviteForm } from '@/interfaces/invite'
import type { Counterparty, CounterpartyType } from '@/interfaces/master'
import { addAudit } from '@/lib/audit/add-audit'
import { validateInvite } from '@/lib/drafting/validate-invite'
import { addCounterparty } from '@/lib/master/add-counterparty'

const CLOSED = { open: false, name: '', email: '', contact: '', error: '' }

interface Options {
  parties: Counterparty[]
  session: Session
  regionId: string
  onInvited: (id: string) => void
}

/* State and actions of the "invite a new second party" form. */
export function useInviteParty({ parties, session, regionId, onInvited }: Options) {
  const [invite, setInvite] = useState<InviteForm>({ ...CLOSED, type: 'Penyedia' })

  const edit = (patch: Partial<Pick<InviteForm, 'name' | 'email' | 'contact'>>) => setInvite((i) => ({ ...i, ...patch, error: '' }))
  const setType = (type: CounterpartyType) => setInvite((i) => ({ ...i, type }))
  const open = () => setInvite((i) => ({ ...i, open: true }))
  const cancel = () => setInvite((i) => ({ ...i, open: false, error: '' }))

  const send = () => {
    const error = validateInvite(invite, parties)
    if (error) return setInvite({ ...invite, error })
    const cp = addCounterparty({ name: invite.name.trim(), type: invite.type, email: invite.email.trim(), contact: invite.contact.trim(), address: '-', invited: true })
    addAudit({ actor: session.name, role: 'Perangkat Desa', action: 'Mengundang pihak kedua', detail: `${cp.name} · ${cp.email}`, villageId: session.role.villageId, regionId })
    onInvited(cp.id)
    setInvite({ ...CLOSED, type: invite.type })
  }

  return { invite, edit, setType, open, cancel, send }
}
