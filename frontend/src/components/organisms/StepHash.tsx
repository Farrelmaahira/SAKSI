import Check from '@/components/atoms/Check'
import Cross from '@/components/atoms/Cross'
import PillButton from '@/components/atoms/PillButton'
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
  const changed = sealed && liveHash ? [...liveHash].filter((ch, i) => ch !== sealed[i]).length : 0
  const matches = sealed && liveHash === sealed

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

      <div className="bg-ink rounded-[1.6rem] text-white flex flex-col gap-24 p-28 hash-panel">
        <p className="text-[1.2rem] opacity-[0.6] uppercase">Sidik digital SHA‑256</p>
        <p className="font-code text-[1.6rem] tracking-[0.04em] leading-[1.6] min-h-[4.8em] break-all md:text-[1.9rem] hash-value">
          {sealed ? (
            [...liveHash].map((ch, i) => (
              <span key={i} className={ch !== sealed[i] ? '[.hash-value_&]:bg-red [.hash-value_&]:rounded-[0.2rem]' : ''}>
                {ch}
              </span>
            ))
          ) : scramble ? (
            <span className="opacity-[0.55]">{scramble}</span>
          ) : (
            <span className="font-body opacity-[0.4]">Belum disegel</span>
          )}
        </p>
        {!sealed && (
          <PillButton tone="light" onClick={onSeal} disabled={Boolean(scramble)}>
            Segel dokumen
          </PillButton>
        )}
        {sealed && (
          <div className={`items-center [animation:pop_0.3s_ease-out] rounded-[1.2rem] grid gap-12 grid-cols-[auto_1fr] p-16 [&.is-ok]:bg-blue [&.is-bad]:bg-red [&_p]:text-[1.6rem] [&_small]:text-[1.3rem] [&_small]:opacity-[0.85] hash-status ${matches ? '[.d-checks_li&]:text-blue is-ok' : 'is-bad'}`}>
            {matches ? <Check /> : <Cross />}
            <div>
              <p>{matches ? 'Cocok dengan segel' : 'Tidak cocok. Isi dokumen sudah berubah.'}</p>
              <small>{matches ? 'Isi kontrak sama persis dengan saat disegel.' : `${changed} dari 64 karakter berubah karena nilai diganti.`}</small>
            </div>
            {!matches && (
              <button type="button" className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue [&.light:hover:not(:disabled)]:[color:inherit] [&.light:hover:not(:disabled)]:opacity-[0.7] disabled:cursor-not-allowed disabled:opacity-[0.3] light [.hash-actions_&:hover]:[color:inherit] [.hash-actions_&:hover]:opacity-[0.7] [.verify-samples_&]:mt-0 [.verify-samples_&]:mr-24 [.verify-samples_&]:mb-10 [.verify-samples_&]:ml-0 [.hash-status_&]:[grid-column:2] [.hash-status_&]:[justify-self:start] [.d-panel-ink_.verify-samples_&]:mt-0 [.d-panel-ink_.verify-samples_&]:mr-20 [.d-panel-ink_.verify-samples_&]:mb-10 [.d-panel-ink_.verify-samples_&]:ml-0" onClick={onRestore}>
                Kembalikan
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
