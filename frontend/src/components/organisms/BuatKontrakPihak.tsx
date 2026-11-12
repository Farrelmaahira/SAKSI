import Hint from '@/components/atoms/Hint'
import StepTitle from '@/components/atoms/StepTitle'
import PartyOption from '@/components/molecules/PartyOption'
import type { TemplateInfo } from '@/interfaces/drafting'
import type { Counterparty } from '@/interfaces/master'

interface Props {
  info: TemplateInfo
  choices: Counterparty[]
  partyId: string
  onPick: (id: string) => void
}

/* Wizard step 2: choose the second party among the businesses registered on the server */
export default function BuatKontrakPihak({ info, choices, partyId, onPick }: Props) {
  return (
    <div>
      <StepTitle>Siapa pihak keduanya?</StepTitle>
      <Hint>Untuk kontrak {info.label.toLowerCase()}, pihak kedua bertipe {info.partyTypes.join(' atau ')}.</Hint>
      <div className="grid gap-8 my-16 mx-0" role="radiogroup">
        {choices.map((p) => (
          <PartyOption key={p.id} party={p} selected={partyId === p.id} onPick={() => onPick(p.id)} />
        ))}
        {!choices.length && <Hint>Belum ada pihak kedua terdaftar dengan tipe ini.</Hint>}
      </div>
    </div>
  )
}
