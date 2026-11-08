import Meterai from '@/components/atoms/Meterai'
import SignBlock from '@/components/molecules/SignBlock'
import type { Clause } from '@/interfaces/drafting'
import type { ContractSignatures } from '@/interfaces/db'
import { fmtDate } from '@/lib/dates/fmt-date'

interface Props {
  title: string
  /* Absent while the contract is still being created */
  code?: string
  village: string
  /* Name of the Kepala Desa, who signs for the first party */
  head: string
  second: string
  /* ISO date the letter is dated */
  date: string
  clauses: Pick<Clause, 'title' | 'text'>[]
  signatures: ContractSignatures
}

/* The contract as a letter, with the handwritten signatures and the e-meterai where they will sit once applied. */
export default function LetterPreview({ title, code, village, head, second, date, clauses, signatures }: Props) {
  return (
    <article className="bg-white border-[0.15rem] border-line border-solid rounded-[1.2rem] text-ink grid gap-20 max-w-780 p-24 md:p-40 w-full" aria-label={`Pratinjau surat ${title}`}>
      <header className="border-b-[0.2rem] border-b-ink border-solid grid gap-2 pb-14 text-center">
        <p className="text-[1.3rem] tracking-[0.08em] uppercase">Pemerintah {village}</p>
        <small className="text-[1.1rem] text-dim uppercase">SAKSI · Sistem Audit Kontrak Segel Integritas</small>
      </header>

      <div className="grid gap-4 text-center">
        <h3 className="text-[2rem] font-[500] tracking-[0.02em] uppercase">{title}</h3>
        <p className="text-[1.3rem] text-dim">{code ? `Nomor ${code}` : 'Nomor diberikan setelah disimpan'}</p>
      </div>

      <p className="text-[1.4rem] leading-[1.6]">
        Pada {fmtDate(date)}, yang bertanda tangan di bawah ini: <strong>{head}</strong>, Kepala {village}, selanjutnya disebut Pihak Pertama, dan <strong>{second}</strong>, selanjutnya disebut Pihak Kedua, sepakat menetapkan pasal-pasal berikut.
      </p>

      <ol className="grid gap-14 list-none">
        {clauses.map((c, i) => (
          <li key={c.title} className="grid gap-4">
            <h4 className="text-[1.4rem] font-[500]">
              Pasal {i + 1}. {c.title}
            </h4>
            <p className="text-[1.35rem] leading-[1.6]">{c.text}</p>
          </li>
        ))}
      </ol>

      <div className="gap-24 grid pt-10 md:grid-cols-2">
        <SignBlock role="Pihak Pertama, Kepala Desa" name={head} signature={signatures.desa} emptyText="Belum ditandatangani" fallback="a">
          <div className="absolute bottom-8 right-0 [transform:scale(0.8)] origin-bottom-right">
            {signatures.meterai ? (
              <Meterai serial={signatures.meterai.serial} />
            ) : (
              <span className="border-[0.1rem] border-dashed border-line rounded-[0.6rem] text-[1rem] text-dim block px-8 py-10 text-center uppercase">Tempat e-meterai</span>
            )}
          </div>
        </SignBlock>
        <SignBlock role="Pihak Kedua" name={second} signature={signatures.pihak} emptyText="Belum ditandatangani" fallback="b" />
      </div>
    </article>
  )
}
