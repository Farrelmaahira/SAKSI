import Check from '@/components/atoms/Check'
import Cross from '@/components/atoms/Cross'
import Grip from '@/components/atoms/Grip'
import Pen from '@/components/atoms/Pen'
import Typewriter from '@/components/atoms/Typewriter'
import DragItem from '@/components/molecules/DragItem'
import DropZone from '@/components/molecules/DropZone'
import PaperHead from '@/components/molecules/PaperHead'
import SimFeedback from '@/components/molecules/SimFeedback'
import { clauses, distractor, trayOrder } from '@/data/simulator'

interface Props {
  placed: string[]
  aiIds: string[]
  message: string | null
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  onApplyAi: (id: string) => void
}

export default function StepClauses({ placed, aiIds, message, onAdd, onRemove, onApplyAi }: Props) {
  const missing = clauses.filter((c) => !placed.includes(c.id))
  const suggestion = placed.length >= 2 ? missing[0] : undefined

  return (
    <>
      <div className="sim-split">
        <div className="tray">
          <p className="tray-label">Kartu pasal</p>
          <div className="chip-list">
            {trayOrder
              .filter((id) => !placed.includes(id))
              .map((id) => {
                const c = [...clauses, distractor].find((x) => x.id === id)!
                return (
                  <DragItem key={id} id={id} className="clause-chip" onPick={() => onAdd(id)}>
                    <Grip />
                    {c.title}
                  </DragItem>
                )
              })}
          </div>
          <div className="audit">
            <div className="audit-head">
              <p>Audit kelengkapan</p>
              <strong>
                {placed.length}/{clauses.length}
              </strong>
            </div>
            <div className="audit-bar">
              <span style={{ width: `${(placed.length / clauses.length) * 100}%` }} />
            </div>
            <ul>
              {clauses.map((c) => (
                <li key={c.id} className={placed.includes(c.id) ? 'ok' : ''}>
                  {placed.includes(c.id) ? <Check /> : <span className="dot" />}
                  {c.title}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DropZone id="draft" className="draft">
          <div className="paper">
            <PaperHead title="Perjanjian Pengadaan Barang" status={missing.length === 0 ? 'Lengkap' : 'Draf'} ok={missing.length === 0} />
            {placed.length === 0 ? (
              <p className="hand paper-empty">seret pasal ke sini</p>
            ) : (
              <ol className="paper-clauses">
                {clauses
                  .filter((c) => placed.includes(c.id))
                  .map((c, i) => (
                    <li key={c.id} className={aiIds.includes(c.id) ? 'is-ai' : ''}>
                      <p className="clause-title">
                        Pasal {i + 1}. {c.title}
                        {aiIds.includes(c.id) && <span className="ai-badge">ditulis AI</span>}
                        <button type="button" className="remove" onClick={() => onRemove(c.id)} aria-label={`Hapus pasal ${c.title}`}>
                          <Cross />
                        </button>
                      </p>
                      <p className="clause-text">{aiIds.includes(c.id) ? <Typewriter text={c.text} /> : c.text}</p>
                    </li>
                  ))}
              </ol>
            )}
          </div>
          {suggestion && (
            <div className="ai-suggest">
              <p className="ai-tag">
                <Pen />
                Rekomendasi AI
              </p>
              <p>
                Pasal <strong>{suggestion.title}</strong> belum ada. {suggestion.why}
              </p>
              <button type="button" className="ai-apply-btn" onClick={() => onApplyAi(suggestion.id)}>
                Terapkan
              </button>
            </div>
          )}
        </DropZone>
      </div>
      <SimFeedback message={message} />
    </>
  )
}
