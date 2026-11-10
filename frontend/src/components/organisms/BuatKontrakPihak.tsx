import Btn from '@/components/atoms/Btn'
import Hint from '@/components/atoms/Hint'
import StepTitle from '@/components/atoms/StepTitle'
import InvitePartyForm from '@/components/organisms/InvitePartyForm'
import PartyOption from '@/components/molecules/PartyOption'
import type { TemplateInfo } from '@/interfaces/drafting'
import type { Counterparty } from '@/interfaces/master'
import type { useInviteParty } from '@/hooks/use-invite-party'

interface Props {
  info: TemplateInfo
  choices: Counterparty[]
  partyId: string
  onPick: (id: string) => void
  inviting: ReturnType<typeof useInviteParty>
}

/* Wizard step 2: choose the second party, or invite a new one */
export default function BuatKontrakPihak({ info, choices, partyId, onPick, inviting }: Props) {
  const { invite, edit, setType, open, cancel, send } = inviting
  return (
    <div>
      <StepTitle>Siapa pihak keduanya?</StepTitle>
      <Hint>Untuk kontrak {info.label.toLowerCase()}, pihak kedua bertipe {info.partyTypes.join(' atau ')}.</Hint>
      <div className="grid gap-8 my-16 mx-0" role="radiogroup">
        {choices.map((p) => (
          <PartyOption key={p.id} party={p} selected={partyId === p.id} onPick={() => onPick(p.id)} />
        ))}
        {!choices.length && <Hint>Belum ada pihak kedua dengan tipe ini. Undang yang baru di bawah.</Hint>}
      </div>
      {invite.open ? (
        <InvitePartyForm form={invite} types={info.partyTypes} onEdit={edit} onType={setType} onSend={send} onCancel={cancel} />
      ) : (
        <Btn variant="ghost" icon="plus" onClick={open}>
          Undang pihak kedua baru
        </Btn>
      )}
    </div>
  )
}
