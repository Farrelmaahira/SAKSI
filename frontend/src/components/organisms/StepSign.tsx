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
      <div className="grid gap-20 lg:[align-items:start] lg:gap-30 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-10 min-w-0">
          <p className="text-[1.2rem] opacity-[0.6] uppercase">Tanda tangan dan meterai</p>
          {signItems.map((s) => (
            <DragItem key={s.id} id={s.id} className={cn('text-[1.5rem] sign-chip', signed[s.key] && 'is-used')} onPick={() => onPlace(s.id, s.zone)} disabled={signed[s.key]}>
              <Grip />
              {s.key === 'meterai' ? <span className="bg-blue rounded-[0.4rem] text-white text-[1.1rem] py-5 px-8">10000</span> : <Signature variant={s.key === 'kades' ? 'a' : 'b'} />}
              <span>{s.label}</span>
            </DragItem>
          ))}
          <p className="self-start border-[0.1rem] border-ink border-solid rounded-[3rem] text-[1.2rem] mt-8 py-5 px-12 uppercase">Simulasi, tidak berkekuatan hukum</p>
        </div>
        <div className="sign-paper bg-white rounded-[1.6rem] min-h-300 p-24 lg:p-36">
          <PaperHead title="Perjanjian Pengadaan Barang" status={allSigned ? 'Disahkan' : 'Menunggu'} ok={allSigned} />
          {[92, 78, 86, 64].map((w) => (
            <span key={w} className="bg-[#e3e3e0] rounded-[0.4rem] block h-7 mb-8" style={{ width: `${w}%` }} />
          ))}
          <p className="text-[1.4rem] mt-24 mx-0 mb-16">Sukamaju, {today()}</p>
          <div className="grid gap-10 grid-cols-[1fr_1fr] md:items-stretch md:grid-cols-[1fr_13rem_1fr]">
            <DropZone id="zone-kades" className="bg-soft rounded-[1.2rem] flex flex-col justify-between min-h-150 p-12 text-center [&.is-meterai]:[grid-column:1_/_-1] [&.is-meterai]:[grid-row:2] [&.is-meterai]:min-h-120 md:[&.is-meterai]:[grid-column:auto] md:[&.is-meterai]:[grid-row:auto] md:[&.is-meterai]:min-h-150">
              <p className="text-[1.1rem] opacity-[0.6] uppercase">Pihak pertama</p>
              <div className="items-center flex flex-1 justify-center min-h-70 zone-mark">{signed.kades ? <Signature variant="a" /> : <span className="text-blue font-hand text-[2.6rem] leading-[1] [.zone-mark_&]:text-[2.2rem] [.zone-mark_&]:opacity-[0.6]">tanda tangan</span>}</div>
              <p className="text-[1.2rem] leading-[1.3]">Hendra Wijaya, Kepala Desa</p>
            </DropZone>
            <DropZone id="zone-meterai" className="is-meterai bg-soft rounded-[1.2rem] flex flex-col justify-between min-h-150 p-12 text-center [&.is-meterai]:[grid-column:1_/_-1] [&.is-meterai]:[grid-row:2] [&.is-meterai]:min-h-120 md:[&.is-meterai]:[grid-column:auto] md:[&.is-meterai]:[grid-row:auto] md:[&.is-meterai]:min-h-150">
              <p className="text-[1.1rem] opacity-[0.6] uppercase">Meterai</p>
              <div className="items-center flex flex-1 justify-center min-h-70 zone-mark">{signed.meterai ? <Meterai /> : <span className="text-blue font-hand text-[2.6rem] leading-[1] [.zone-mark_&]:text-[2.2rem] [.zone-mark_&]:opacity-[0.6]">tempel di sini</span>}</div>
            </DropZone>
            <DropZone id="zone-penyedia" className="bg-soft rounded-[1.2rem] flex flex-col justify-between min-h-150 p-12 text-center [&.is-meterai]:[grid-column:1_/_-1] [&.is-meterai]:[grid-row:2] [&.is-meterai]:min-h-120 md:[&.is-meterai]:[grid-column:auto] md:[&.is-meterai]:[grid-row:auto] md:[&.is-meterai]:min-h-150">
              <p className="text-[1.1rem] opacity-[0.6] uppercase">Pihak kedua</p>
              <div className="items-center flex flex-1 justify-center min-h-70 zone-mark">{signed.penyedia ? <Signature variant="b" /> : <span className="text-blue font-hand text-[2.6rem] leading-[1] [.zone-mark_&]:text-[2.2rem] [.zone-mark_&]:opacity-[0.6]">tanda tangan</span>}</div>
              <p className="text-[1.2rem] leading-[1.3]">Rina Kartika, CV Maju Bersama</p>
            </DropZone>
          </div>
        </div>
      </div>
      <SimFeedback message={message} />
    </>
  )
}
