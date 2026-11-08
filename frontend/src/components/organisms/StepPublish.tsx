import Illustration from '@/components/atoms/Illustration'
import Check from '@/components/atoms/Check'
import PillButton from '@/components/atoms/PillButton'
import { clauses } from '@/data/simulator'
import type { Contract } from '@/interfaces/contract'
import { formatRp } from '@/lib/contracts/format-rp'
import { shortHash } from '@/lib/contracts/short-hash'

interface Props {
  published: Contract | null
  sealed: string
  onPublish: () => void
  onReset: () => void
}

export default function StepPublish({ published, sealed, onPublish, onReset }: Props) {
  return (
    <div className="publish-step">
      {!published ? (
        <div className="items-center bg-white rounded-[1.6rem] grid gap-30 p-30 [&_img]:my-0 [&_img]:mx-auto [&_img]:max-h-240 md:grid-cols-[0.8fr_1.2fr] md:p-40">
          <Illustration name="online-community_3o0l" />
          <div>
            <p className="text-blue text-[1.3rem] uppercase">Siap dipublikasikan</p>
            <ul className="grid gap-12 list-none list-outside mt-20 mx-0 mb-30 [&_li]:items-center [&_li]:flex [&_li]:text-[1.6rem] [&_li]:gap-10 checklist">
              <li>
                <Check /> Jenis kontrak: Pengadaan
              </li>
              <li>
                <Check /> {clauses.length} dari {clauses.length} pasal wajib lengkap
              </li>
              <li>
                <Check /> Tanda tangan dan e‑meterai (simulasi)
              </li>
              <li>
                <Check /> Disegel dengan hash {shortHash(sealed)}
              </li>
            </ul>
            <PillButton tone="blue" onClick={onPublish}>
              Publikasikan kontrak
            </PillButton>
          </div>
        </div>
      ) : (
        <div className="[animation:pop_0.45s_ease-out] bg-white border-[0.2rem] border-ink border-solid rounded-[1.6rem] [box-shadow:0.8rem_0.8rem_0_var(--color-blue)] p-28 [&_h4]:text-[2.8rem] [&_h4]:font-[320] [&_h4]:tracking-[-0.02em] [&_h4]:leading-[1.15] [&_h4]:mt-20 [&_h4]:mx-0 [&_h4]:mb-10 md:p-40 md:[&_h4]:text-[3.6rem]">
          <div className="items-center flex flex-wrap gap-10 justify-between">
            <span className="bg-blue rounded-[3rem] text-white text-[1.2rem] py-5 px-12 uppercase">Terbuka untuk publik</span>
            <span className="font-code text-[1.4rem] bg-soft rounded-[0.4rem] py-2 px-6">{published.code}</span>
          </div>
          <h4>{published.title}</h4>
          <p className="text-[1.5rem] opacity-[0.7]">
            {published.village} · {formatRp(published.value)}
          </p>
          <p className="text-[1.4rem] mt-12 [&_code]:bg-soft [&_code]:rounded-[0.4rem] [&_code]:py-2 [&_code]:px-6 [&_code]:font-code">
            Hash <code>{shortHash(sealed)}</code>
          </p>
          <ol className="grid gap-14 list-none list-outside my-28 mx-0 [&_li]:items-center [&_li]:flex [&_li]:gap-14 [&_strong]:block [&_strong]:text-[1.6rem] [&_strong]:font-[400] [&_small]:text-[1.3rem] [&_small]:opacity-[0.6] mini-timeline">
            {published.milestones.map((m) => (
              <li key={m.label} className={`[.mini-timeline_&.is-pending]:opacity-50 is-${m.status}`}>
                <span className="items-center border-[0.15rem] border-current border-solid rounded-[50%] flex flex-none h-28 justify-center w-28 [.is-current>&]:after:bg-current [.is-current>&]:after:rounded-[50%] [.is-current>&]:after:content-[''] [.is-current>&]:after:h-10 [.is-current>&]:after:w-10 [.mini-timeline_.is-done_&]:bg-blue [.mini-timeline_.is-done_&]:border-blue [.mini-timeline_.is-done_&]:text-white [.mini-timeline_.is-current_&]:border-blue [.mini-timeline_.is-current_&]:after:bg-blue">{m.status === 'done' && <Check />}</span>
                <span>
                  <strong>{m.label}</strong>
                  <small>{m.date}</small>
                </span>
              </li>
            ))}
          </ol>
          <div className="items-center flex flex-wrap gap-24">
            <PillButton tone="blue" to={`/lacak?q=${published.code}`}>
              Lacak kontrak ini
            </PillButton>
            <button type="button" className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue [&.light:hover:not(:disabled)]:[color:inherit] [&.light:hover:not(:disabled)]:opacity-[0.7] disabled:cursor-not-allowed disabled:opacity-[0.3] [.hash-actions_&:hover]:[color:inherit] [.hash-actions_&:hover]:opacity-[0.7] [.verify-samples_&]:mt-0 [.verify-samples_&]:mr-24 [.verify-samples_&]:mb-10 [.verify-samples_&]:ml-0 [.hash-status_&]:[grid-column:2] [.hash-status_&]:[justify-self:start] [.d-panel-ink_.verify-samples_&]:mt-0 [.d-panel-ink_.verify-samples_&]:mr-20 [.d-panel-ink_.verify-samples_&]:mb-10 [.d-panel-ink_.verify-samples_&]:ml-0" onClick={onReset}>
              Ulangi simulasi
            </button>
          </div>
          <p className="text-[1.3rem] mt-20 opacity-[0.6]">Kontrak contoh ini tersimpan di peramban Anda dan bisa dicari di halaman Lacak.</p>
        </div>
      )}
    </div>
  )
}
