import Grip from '@/components/atoms/Grip'
import Meterai from '@/components/atoms/Meterai'
import Signature from '@/components/atoms/Signature'
import DragItem from '@/components/molecules/DragItem'
import DropZone from '@/components/molecules/DropZone'
import PaperHead from '@/components/molecules/PaperHead'
import SimFeedback from '@/components/molecules/SimFeedback'
import { signItems } from '@/data/simulator'
import type { SignedState } from '@/interfaces/simulator'
import { today } from '@/lib/simulator/today'
import { cn } from '@/lib/utils'

interface Props {
  signed: SignedState
  message: string | null
  onPlace: (id: string, zone: string) => void
}

export default function StepSign({ signed, message, onPlace }: Props) {
  const allSigned = signed.kades && signed.meterai && signed.penyedia

  return (
    <>
      <div className="sim-split">
        <div className="tray">
          <p className="tray-label">Tanda tangan dan meterai</p>
          {signItems.map((s) => (
            <DragItem key={s.id} id={s.id} className={cn('sign-chip', signed[s.key] && 'is-used')} onPick={() => onPlace(s.id, s.zone)} disabled={signed[s.key]}>
              <Grip />
              {s.key === 'meterai' ? <span className="chip-meterai">10000</span> : <Signature variant={s.key === 'kades' ? 'a' : 'b'} />}
              <span>{s.label}</span>
            </DragItem>
          ))}
          <p className="sim-badge">Simulasi, tidak berkekuatan hukum</p>
        </div>
        <div className="paper sign-paper">
          <PaperHead title="Perjanjian Pengadaan Barang" status={allSigned ? 'Disahkan' : 'Menunggu'} ok={allSigned} />
          {[92, 78, 86, 64].map((w) => (
            <span key={w} className="paper-bar" style={{ width: `${w}%` }} />
          ))}
          <p className="sign-place">Sukamaju, {today()}</p>
          <div className="sign-grid">
            <DropZone id="zone-kades" className="sign-zone">
              <p className="zone-role">Pihak pertama</p>
              <div className="zone-mark">{signed.kades ? <Signature variant="a" /> : <span className="hand">tanda tangan</span>}</div>
              <p className="zone-name">Hendra Wijaya, Kepala Desa</p>
            </DropZone>
            <DropZone id="zone-meterai" className="sign-zone is-meterai">
              <p className="zone-role">Meterai</p>
              <div className="zone-mark">{signed.meterai ? <Meterai /> : <span className="hand">tempel di sini</span>}</div>
            </DropZone>
            <DropZone id="zone-penyedia" className="sign-zone">
              <p className="zone-role">Pihak kedua</p>
              <div className="zone-mark">{signed.penyedia ? <Signature variant="b" /> : <span className="hand">tanda tangan</span>}</div>
              <p className="zone-name">Rina Kartika, CV Maju Bersama</p>
            </DropZone>
          </div>
        </div>
      </div>
      <SimFeedback message={message} />
    </>
  )
}
