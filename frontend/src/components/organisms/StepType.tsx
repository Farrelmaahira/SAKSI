import Illustration from '@/components/atoms/Illustration'
import TypeIcon from '@/components/atoms/TypeIcon'
import DragItem from '@/components/molecules/DragItem'
import DropZone from '@/components/molecules/DropZone'
import SimFeedback from '@/components/molecules/SimFeedback'
import TypeCardBody from '@/components/molecules/TypeCardBody'
import { types } from '@/data/simulator'
import { cn } from '@/lib/utils'

interface Props {
  type: string | null
  message: string | null
  onChoose: (id: string) => void
  onClear: () => void
}

export default function StepType({ type, message, onChoose, onClear }: Props) {
  return (
    <>
      <div className="grid gap-20 lg:[align-items:start] lg:gap-30 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-10 min-w-0">
          <p className="text-[1.2rem] opacity-[0.6] uppercase">Kartu jenis kontrak</p>
          {types.map((t) => (
            <DragItem key={t.id} id={t.id} className={cn('[&_strong]:block [&_strong]:text-[1.8rem] [&_strong]:font-[400] [&_small]:text-[1.3rem] [&_small]:opacity-[0.65]', type === t.id && 'is-used')} onPick={() => onChoose(t.id)} disabled={type === t.id}>
              <TypeCardBody option={t} />
            </DragItem>
          ))}
        </div>
        <DropZone id="desk" className="items-center bg-white rounded-[1.6rem] flex justify-center min-h-300 p-30">
          {type ? (
            <div className="[animation:pop_0.4s_ease-out] text-center [&>p:not(.desk-kicker):not(.desk-title)]:text-[1.6rem] [&>p:not(.desk-kicker):not(.desk-title)]:leading-[1.5] [&>p:not(.desk-kicker):not(.desk-title)]:mt-0 [&>p:not(.desk-kicker):not(.desk-title)]:mx-auto [&>p:not(.desk-kicker):not(.desk-title)]:mb-20 [&>p:not(.desk-kicker):not(.desk-title)]:max-w-380">
              <span className="items-center bg-blue rounded-[50%] inline-flex h-80 justify-center mb-20 w-80 desk-icon">
                <TypeIcon kind={type} />
              </span>
              <p className="text-[1.2rem] opacity-[0.6] uppercase desk-kicker">Jenis kontrak</p>
              <p className="text-[4rem] font-[320] tracking-[-0.03em] mt-4 mx-0 mb-12 desk-title">{type}</p>
              <p>Tepat. Desa membeli barang dari penyedia, jadi bentuk kontraknya pengadaan.</p>
              <button type="button" className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue [&.light:hover:not(:disabled)]:[color:inherit] [&.light:hover:not(:disabled)]:opacity-[0.7] disabled:cursor-not-allowed disabled:opacity-[0.3] [.hash-actions_&:hover]:[color:inherit] [.hash-actions_&:hover]:opacity-[0.7] [.verify-samples_&]:mt-0 [.verify-samples_&]:mr-24 [.verify-samples_&]:mb-10 [.verify-samples_&]:ml-0 [.hash-status_&]:[grid-column:2] [.hash-status_&]:[justify-self:start] [.d-panel-ink_.verify-samples_&]:mt-0 [.d-panel-ink_.verify-samples_&]:mr-20 [.d-panel-ink_.verify-samples_&]:mb-10 [.d-panel-ink_.verify-samples_&]:ml-0" onClick={onClear}>
                Ganti pilihan
              </button>
            </div>
          ) : (
            <div className="text-center [&_img]:mt-0 [&_img]:mx-auto [&_img]:mb-16 [&_img]:w-200">
              <Illustration name="writing-online_x665" />
              <p className="text-blue font-hand text-[2.6rem] leading-[1] [.zone-mark_&]:text-[2.2rem] [.zone-mark_&]:opacity-[0.6]">seret kartu ke meja ini</p>
            </div>
          )}
        </DropZone>
      </div>
      <SimFeedback message={message} />
    </>
  )
}
