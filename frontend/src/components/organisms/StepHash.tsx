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
    <div className="hash-step">
      <div className="paper hash-paper">
        <PaperHead title="Ringkasan kontrak" status="Disahkan" ok />
        <dl className="facts">
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
              <span className="money-input">
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
        {sealed ? <p className="hand hash-tip">ubah satu angka saja</p> : <p className="fact-note">Nilai bisa diubah setelah dokumen disegel.</p>}
      </div>

      <div className="hash-panel">
        <p className="hash-label">Sidik digital SHA‑256</p>
        <p className="hash-value">
          {sealed ? (
            [...liveHash].map((ch, i) => (
              <span key={i} className={ch !== sealed[i] ? 'diff' : ''}>
                {ch}
              </span>
            ))
          ) : scramble ? (
            <span className="scrambling">{scramble}</span>
          ) : (
            <span className="hash-empty">Belum disegel</span>
          )}
        </p>
        {!sealed && (
          <PillButton tone="light" onClick={onSeal} disabled={Boolean(scramble)}>
            Segel dokumen
          </PillButton>
        )}
        {sealed && (
          <div className={`hash-status ${matches ? 'is-ok' : 'is-bad'}`}>
            {matches ? <Check /> : <Cross />}
            <div>
              <p>{matches ? 'Cocok dengan segel' : 'Tidak cocok. Isi dokumen sudah berubah.'}</p>
              <small>{matches ? 'Isi kontrak sama persis dengan saat disegel.' : `${changed} dari 64 karakter berubah karena nilai diganti.`}</small>
            </div>
            {!matches && (
              <button type="button" className="text-btn light" onClick={onRestore}>
                Kembalikan
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
