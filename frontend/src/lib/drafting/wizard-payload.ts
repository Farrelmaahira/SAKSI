import type { Answers, TemplateKey } from '@/interfaces/drafting'
import type { WizardPreviewPayload } from '@/lib/api/contracts'
import { backendJenis } from '@/data/drafting'
import { titleFor } from '@/lib/db/title-for'

/* Wizard answers -> backend payload shared by /contracts/wizard/preview and POST /contracts. counterpartyId is the backend id, never a guess. */
export const wizardPayload = (template: TemplateKey, answers: Answers, counterpartyId: number): WizardPreviewPayload => ({
  counterpartyId,
  jenis: backendJenis[template],
  judul: titleFor(template, answers.work),
  nilai: answers.value,
  tenggat: answers.deadline,
  skemaPembayaran: answers.scheme.toLowerCase(),
  metodePemilihan: answers.method === 'Pengadaan langsung' ? 'pengadaan_langsung' : 'lelang_terbatas',
  jawabanForm: { ...answers },
})
