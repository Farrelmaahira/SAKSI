import { useState } from 'react'
import type { InviteForm } from '@/interfaces/invite'
import type { Counterparty, CounterpartyType } from '@/interfaces/master'
import { validateInvite } from '@/lib/drafting/validate-invite'
import { addCounterparty } from '@/lib/master/add-counterparty'

const CLOSED = { open: false, name: '', email: '', contact: '', error: '' }

interface Options {
  parties: Counterparty[]
  onInvited: (id: string) => void
}

/* State and actions of the "invite a new second party" form. */
export function useInviteParty({ parties, onInvited }: Options) {
  const [invite, setInvite] = useState<InviteForm>({ ...CLOSED, type: 'Penyedia' })

  const edit = (patch: Partial<Pick<InviteForm, 'name' | 'email' | 'contact'>>) => setInvite((i) => ({ ...i, ...patch, error: '' }))
  const setType = (type: CounterpartyType) => setInvite((i) => ({ ...i, type }))
  const open = () => setInvite((i) => ({ ...i, open: true }))
  const cancel = () => setInvite((i) => ({ ...i, open: false, error: '' }))

  const send = () => {
    const error = validateInvite(invite, parties)
    if (error) return setInvite({ ...invite, error })
    const cp = addCounterparty({ name: invite.name.trim(), type: invite.type, email: invite.email.trim(), contact: invite.contact.trim(), address: '-', invited: true })
    onInvited(cp.id)
    setInvite({ ...CLOSED, type: invite.type })
  }

  return { invite, edit, setType, open, cancel, send }
}
