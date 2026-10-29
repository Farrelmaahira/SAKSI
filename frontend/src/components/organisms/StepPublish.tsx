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
        <div className="publish-ready">
          <Illustration name="online-community_3o0l" />
          <div>
            <p className="publish-kicker">Siap dipublikasikan</p>
            <ul className="checklist">
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
        <div className="board-card">
          <div className="board-top">
            <span className="board-tag">Terbuka untuk publik</span>
            <span className="board-code">{published.code}</span>
          </div>
          <h4>{published.title}</h4>
          <p className="board-meta">
            {published.village} · {formatRp(published.value)}
          </p>
          <p className="board-hash">
            Hash <code>{shortHash(sealed)}</code>
          </p>
          <ol className="mini-timeline">
            {published.milestones.map((m) => (
              <li key={m.label} className={`is-${m.status}`}>
                <span className="mt-dot">{m.status === 'done' && <Check />}</span>
                <span>
                  <strong>{m.label}</strong>
                  <small>{m.date}</small>
                </span>
              </li>
            ))}
          </ol>
          <div className="board-actions">
            <PillButton tone="blue" to={`/lacak?q=${published.code}`}>
              Lacak kontrak ini
            </PillButton>
            <button type="button" className="text-btn" onClick={onReset}>
              Ulangi simulasi
            </button>
          </div>
          <p className="board-note">Kontrak contoh ini tersimpan di peramban Anda dan bisa dicari di halaman Lacak.</p>
        </div>
      )}
    </div>
  )
}
