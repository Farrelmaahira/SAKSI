import HashPanel from '@/components/molecules/HashPanel'
import PaperHead from '@/components/molecules/PaperHead'

interface Props {
  code: string
  clauseCount: number
  value: number
  sealed: string
  scramble: string
  liveHash: string
  onValue: (value: number) => void
  onSeal: () => void
  onRestore: () => void
}

export default function StepHash({ code, clauseCount, value, sealed, scramble, liveHash, onValue, onSeal, onRestore }: Props) {

  return (
    <div className="grid gap-16 lg:[align-items:start] lg:gap-24 lg:grid-cols-[1fr_1.1fr]">
      <div className="hash-paper bg-white rounded-[1.6rem] min-h-300 p-24 lg:p-36">
        <PaperHead title="Ringkasan kontrak" status="Disahkan" ok />
        <dl className="grid gap-12 [&>div]:items-center [&>div]:border-b-[0.1rem] [&>div]:border-b-[rgba(15,_15,_23,_0.1)] [&>div]:[border-bottom-style:solid] [&>div]:flex [&>div]:gap-20 [&>div]:justify-between [&>div]:pb-12 [&_dt]:text-[1.4rem] [&_dt]:opacity-[0.6] [&_dd]:text-[1.6rem] [&_dd]:text-right">
          <div>
            <dt>Kode</dt>
            <dd>{code}</dd>
          </div>
          <div>
            <dt>Jenis</dt>
            <dd>Pengadaan</dd>
          </div>
          <div>
            <dt>Penyedia</dt>
            <dd>CV Maju Bersama</dd>
          </div>
          <div>
            <dt>Jumlah pasal</dt>
            <dd>{clauseCount} pasal</dd>
          </div>
          <div className="fact-edit">
            <dt>
              <label htmlFor="sim-value">Nilai kontrak</label>
            </dt>
            <dd>
              <span className="items-center bg-white border-[0.15rem] border-ink border-solid rounded-[1rem] inline-flex gap-6 py-6 px-10 focus-within:border-blue focus-within:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_input]:bg-transparent [&_input]:border-0 [&_input]:border-none [&_input]:[color:inherit] [&_input]:text-[1.6rem] [&_input]:[outline:0] [&_input]:text-right [&_input]:w-130 [&:has(input:disabled)]:opacity-[0.45]">
                <span>Rp</span>
                <input
                  id="sim-value"
                  inputMode="numeric"
                  value={value.toLocaleString('id-ID')}
                  disabled={!sealed}
                  onChange={(e) => onValue(Number(e.target.value.replace(/\D/g, '').slice(0, 12)) || 0)}
                />
              </span>
            </dd>
          </div>
        </dl>
        {sealed ? <p className="text-blue font-hand text-[2.6rem] leading-[1] [.zone-mark_&]:text-[2.2rem] [.zone-mark_&]:opacity-[0.6] mt-20">ubah satu angka saja</p> : <p className="text-[1.3rem] mt-20 opacity-[0.6]">Nilai bisa diubah setelah dokumen disegel.</p>}
      </div>

      <HashPanel sealed={sealed} scramble={scramble} liveHash={liveHash} onSeal={onSeal} onRestore={onRestore} />
    </div>
  )
}
