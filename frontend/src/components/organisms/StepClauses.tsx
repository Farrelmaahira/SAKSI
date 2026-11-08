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
      <div className="grid gap-20 lg:[align-items:start] lg:gap-30 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-10 min-w-0">
          <p className="text-[1.2rem] opacity-[0.6] uppercase">Kartu pasal</p>
          <div className="flex flex-wrap gap-10">
            {trayOrder
              .filter((id) => !placed.includes(id))
              .map((id) => {
                const c = [...clauses, distractor].find((x) => x.id === id)!
                return (
                  <DragItem key={id} id={id} className="text-[1.5rem] py-10 px-14 w-auto" onPick={() => onAdd(id)}>
                    <Grip />
                    {c.title}
                  </DragItem>
                )
              })}
          </div>
          <div className="bg-white rounded-[1.4rem] mt-10 p-20 [&_ul]:grid [&_ul]:gap-y-8 [&_ul]:gap-x-12 [&_ul]:grid-cols-[1fr_1fr] [&_ul]:list-none [&_ul]:list-outside [&_ul]:mt-16 [&_li]:items-center [&_li]:flex [&_li]:text-[1.4rem] [&_li]:gap-8 [&_li]:opacity-[0.5] audit">
            <div className="items-baseline flex justify-between [&_p]:text-[1.3rem] [&_p]:uppercase [&_strong]:text-blue [&_strong]:text-[2.6rem] [&_strong]:font-[400]">
              <p>Audit kelengkapan</p>
              <strong>
                {placed.length}/{clauses.length}
              </strong>
            </div>
            <div className="bg-soft rounded-[1rem] h-8 mt-10 overflow-hidden [&_span]:bg-blue [&_span]:block [&_span]:h-full [&_span]:[transition:width_0.5s_var(--ease-saksi)]">
              <span style={{ width: `${(placed.length / clauses.length) * 100}%` }} />
            </div>
            <ul>
              {clauses.map((c) => (
                <li key={c.id} className={placed.includes(c.id) ? '[.audit_li&]:opacity-[1] ok' : ''}>
                  {placed.includes(c.id) ? <Check /> : <span className="border-[0.15rem] border-current border-solid rounded-[50%] flex-none h-12 m-3 w-12" />}
                  {c.title}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DropZone id="draft" className="rounded-[1.6rem] flex flex-col gap-16">
          <div className="bg-white rounded-[1.6rem] min-h-300 p-24 lg:p-36">
            <PaperHead title="Perjanjian Pengadaan Barang" status={missing.length === 0 ? 'Lengkap' : 'Draf'} ok={missing.length === 0} />
            {placed.length === 0 ? (
              <p className="text-blue font-hand text-[2.6rem] leading-[1] [.zone-mark_&]:text-[2.2rem] [.zone-mark_&]:opacity-[0.6] py-80 px-0 text-center">seret pasal ke sini</p>
            ) : (
              <ol className="grid gap-18 list-none list-outside [&_li]:[animation:pop_0.35s_ease-out] paper-clauses">
                {clauses
                  .filter((c) => placed.includes(c.id))
                  .map((c, i) => (
                    <li key={c.id} className={aiIds.includes(c.id) ? 'is-ai' : ''}>
                      <p className="items-center flex flex-wrap text-[1.4rem] font-[500] gap-10">
                        Pasal {i + 1}. {c.title}
                        {aiIds.includes(c.id) && <span className="bg-blue rounded-[3rem] text-white text-[1.05rem] font-[400] py-2 px-8 uppercase">ditulis AI</span>}
                        <button type="button" className="[background:none] border-0 border-none [color:inherit] ml-auto opacity-[0.35] p-2 [transition:opacity_0.2s] [&:hover]:opacity-[1]" onClick={() => onRemove(c.id)} aria-label={`Hapus pasal ${c.title}`}>
                          <Cross />
                        </button>
                      </p>
                      <p className="text-[1.5rem] leading-[1.5] mt-4 opacity-[0.85] [.paper-clauses_li.is-ai_&]:text-blue [.paper-clauses_li.is-ai_&]:opacity-[1]">{aiIds.includes(c.id) ? <Typewriter text={c.text} /> : c.text}</p>
                    </li>
                  ))}
              </ol>
            )}
          </div>
          {suggestion && (
            <div className="[animation:pop_0.4s_ease-out] bg-white border-[0.2rem] border-ink border-solid rounded-[1.4rem] [box-shadow:0.6rem_0.6rem_0_var(--color-ink)] py-18 px-20 [&>p:not(.ai-tag)]:text-[1.5rem] [&>p:not(.ai-tag)]:leading-[1.45] [&>p:not(.ai-tag)]:mt-8 [&>p:not(.ai-tag)]:mx-0 [&>p:not(.ai-tag)]:mb-14 [&_strong]:font-[500]">
              <p className="items-center text-blue flex text-[1.2rem] font-[500] gap-8 uppercase [&_svg]:[fill:none] [&_svg]:h-16 [&_svg]:[stroke:currentColor] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] [&_svg]:[stroke-width:1.8] [&_svg]:w-16 ai-tag">
                <Pen />
                Rekomendasi AI
              </p>
              <p>
                Pasal <strong>{suggestion.title}</strong> belum ada. {suggestion.why}
              </p>
              <button type="button" className="bg-ink border-0 border-none rounded-[3rem] text-white text-[1.3rem] py-9 px-18 uppercase [transition:background_0.3s] [&:hover]:bg-blue" onClick={() => onApplyAi(suggestion.id)}>
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
