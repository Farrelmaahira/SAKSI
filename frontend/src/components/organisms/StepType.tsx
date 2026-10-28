import Illustration from '@/components/atoms/Illustration'
import TypeIcon from '@/components/atoms/TypeIcon'
import DragItem from '@/components/molecules/DragItem'
import DropZone from '@/components/molecules/DropZone'
import SimFeedback from '@/components/molecules/SimFeedback'
import TypeCardBody from '@/components/molecules/TypeCardBody'
import { types } from '@/data/simulator'
import { cn } from '@/lib/utils'

export interface StepTypeProps {
  type: string | null
  message: string | null
  onChoose: (id: string) => void
  onClear: () => void
}

export default function StepType({ type, message, onChoose, onClear }: StepTypeProps) {
  return (
    <>
      <div className="sim-split">
        <div className="tray">
          <p className="tray-label">Kartu jenis kontrak</p>
          {types.map((t) => (
            <DragItem key={t.id} id={t.id} className={cn('type-card', type === t.id && 'is-used')} onPick={() => onChoose(t.id)} disabled={type === t.id}>
              <TypeCardBody option={t} />
            </DragItem>
          ))}
        </div>
        <DropZone id="desk" className="desk">
          {type ? (
            <div className="desk-filled">
              <span className="desk-icon">
                <TypeIcon kind={type} />
              </span>
              <p className="desk-kicker">Jenis kontrak</p>
              <p className="desk-title">{type}</p>
              <p>Tepat. Desa membeli barang dari penyedia, jadi bentuk kontraknya pengadaan.</p>
              <button type="button" className="text-btn" onClick={onClear}>
                Ganti pilihan
              </button>
            </div>
          ) : (
            <div className="desk-empty">
              <Illustration name="writing-online_x665" />
              <p className="hand">seret kartu ke meja ini</p>
            </div>
          )}
        </DropZone>
      </div>
      <SimFeedback message={message} />
    </>
  )
}
