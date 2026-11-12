import Badge from '@/components/atoms/Badge'
import Callout from '@/components/atoms/Callout'
import StepTitle from '@/components/atoms/StepTitle'
import ConfirmCritical from '@/components/molecules/ConfirmCritical'
import SummaryList from '@/components/molecules/SummaryList'
import BuatKontrakSurat from '@/components/organisms/BuatKontrakSurat'
import type { Answers, Audit, Clause, TemplateInfo, TemplateKey } from '@/interfaces/drafting'
import type { useLetterSigning } from '@/hooks/use-letter-signing'
import { fmtDate } from '@/lib/dates/fmt-date'
import { formatRp } from '@/lib/contracts/format-rp'

interface Props {
  info: TemplateInfo
  template: TemplateKey
  partyName?: string
  partyId: string
  villageId: string
  signerName: string
  answers: Answers
  clauses: Clause[]
  audit: Audit
  critical: number
  confirmed: boolean
  onConfirm: (checked: boolean) => void
  letter: ReturnType<typeof useLetterSigning>
}

/* Wizard step 5: summary of the answers, the audit score and the letter to sign */
export default function BuatKontrakPeriksa({ info, template, partyName, partyId, villageId, signerName, answers, clauses, audit, critical, confirmed, onConfirm, letter }: Props) {
  return (
    <div>
      <StepTitle>Periksa lalu simpan</StepTitle>
      <SummaryList
        rows={[
          ['Jenis', info.label],
          ['Pihak kedua', partyName],
          ['Pekerjaan', answers.work],
          ['Nilai', formatRp(answers.value)],
          ['Tenggat', fmtDate(answers.deadline)],
          ['Pembayaran', answers.scheme === 'Termin' ? `${answers.terms} termin` : 'Sekaligus'],
          ['Skor audit AI', <>{audit.score}/100 {critical > 0 && <Badge tone="red">{critical} temuan kritis</Badge>}</>],
          ['Jumlah pasal', clauses.length],
        ]}
      />
      {critical > 0 && (
        <Callout tone="red" icon="alert">
          Masih ada temuan kritis. Draf bisa disimpan. Untuk mengirim ke pihak kedua, perbaiki temuannya atau konfirmasi di bawah.
        </Callout>
      )}
      {critical > 0 && <ConfirmCritical count={critical} checked={confirmed} onChange={onConfirm} />}
      <BuatKontrakSurat template={template} answers={answers} clauses={clauses} villageId={villageId} partyId={partyId} signerName={signerName} letter={letter} />
    </div>
  )
}
