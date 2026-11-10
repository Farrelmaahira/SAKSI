import StepTitle from '@/components/atoms/StepTitle'
import TemplateCard from '@/components/molecules/TemplateCard'
import type { TemplateKey } from '@/interfaces/drafting'
import { templates } from '@/data/drafting'

interface Props {
  template: TemplateKey | null
  onPick: (k: TemplateKey) => void
}

/* Wizard step 1: which kind of contract */
export default function BuatKontrakJenis({ template, onPick }: Props) {
  return (
    <div>
      <StepTitle>Kontrak apa yang ingin dibuat?</StepTitle>
      <div className="grid gap-12 grid-cols-[repeat(2,minmax(0,1fr))] mt-16 md:grid-cols-[repeat(4,minmax(0,1fr))]">
        {(Object.keys(templates) as TemplateKey[]).map((k) => (
          <TemplateCard key={k} info={templates[k]} selected={template === k} onClick={() => onPick(k)} />
        ))}
      </div>
    </div>
  )
}
