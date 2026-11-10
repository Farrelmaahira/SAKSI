import Btn from '@/components/atoms/Btn'
import Hint from '@/components/atoms/Hint'
import StepTitle from '@/components/atoms/StepTitle'
import LetterPreview from '@/components/organisms/LetterPreview'
import SignaturePad from '@/components/molecules/SignaturePad'
import type { Answers, Clause, TemplateKey } from '@/interfaces/drafting'
import type { useLetterSigning } from '@/hooks/use-letter-signing'
import { draftContext } from '@/lib/db/draft-context'
import { titleFor } from '@/lib/db/title-for'

interface Props {
  template: TemplateKey
  answers: Answers
  clauses: Clause[]
  villageId: string
  partyId: string
  signerName: string
  letter: ReturnType<typeof useLetterSigning>
}

/* Letter preview with the village head's signature pad and the e-meterai button */
export default function BuatKontrakSurat({ template, answers, clauses, villageId, partyId, signerName, letter }: Props) {
  const ctx = draftContext(villageId, partyId)
  return (
    <section className="grid gap-16 pt-30" aria-labelledby="pratinjau-surat">
      <div>
        <StepTitle id="pratinjau-surat">Pratinjau surat</StepTitle>
        <Hint>Tanda tangan dan e-meterai boleh dibubuhkan sekarang atau nanti setelah disetujui. Kalau isi draf diubah lagi, keduanya dihapus dan perlu dibubuhkan ulang.</Hint>
      </div>
      <LetterPreview
        title={titleFor(template, answers.work)}
        village={ctx.village.name}
        head={ctx.head}
        second={ctx.party.name}
        date={letter.date}
        clauses={clauses}
        signatures={{ desa: letter.signature ?? undefined, meterai: letter.meterai ?? undefined }}
      />
      <div className="grid gap-12 max-w-780">
        <strong className="text-[1.6rem] font-[500]">Tanda tangan Kepala Desa</strong>
        <SignaturePad name={signerName} initial={letter.signature?.image} onChange={letter.draw} />
        <div>
          <Btn icon="check" disabled={!letter.signature || Boolean(letter.meterai)} onClick={letter.stamp}>
            {letter.meterai ? 'E-meterai sudah dibubuhkan' : 'Bubuhkan e-meterai Rp10.000'}
          </Btn>
        </div>
      </div>
    </section>
  )
}
