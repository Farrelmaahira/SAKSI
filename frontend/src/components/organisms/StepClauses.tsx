import Cross from '@/components/atoms/Cross'
import Grip from '@/components/atoms/Grip'
import Typewriter from '@/components/atoms/Typewriter'
import DragItem from '@/components/molecules/DragItem'
import DropZone from '@/components/molecules/DropZone'
import PaperHead from '@/components/molecules/PaperHead'
import AiSuggestion from '@/components/molecules/AiSuggestion'
import CompletenessCard from '@/components/molecules/CompletenessCard'
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
          <CompletenessCard placed={placed} />
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
            <AiSuggestion suggestion={suggestion} onApply={() => onApplyAi(suggestion.id)} />
          )}
        </DropZone>
      </div>
      <SimFeedback message={message} />
    </>
  )
}
