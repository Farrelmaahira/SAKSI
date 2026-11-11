'use client'

import BackButton from '@/components/atoms/BackButton'
import FormAlert from '@/components/atoms/FormAlert'
import PillButton from '@/components/atoms/PillButton'
import ReportReview from '@/components/molecules/ReportReview'
import ReportStepper from '@/components/molecules/ReportStepper'
import { formSteps } from '@/data/report-form'
import { useReportForm } from '@/hooks/use-report-form'
import type { SealedContract } from '@/interfaces/contract'
import ReportStepIssue from './ReportStepIssue'
import ReportStepStory from './ReportStepStory'
import ReportTicket from './ReportTicket'

interface Props {
  registry: SealedContract[]
  code: string
  onCode: (code: string) => void
  onOpen: (code: string) => void
}

export default function ReportForm({ registry, code, onCode, onOpen }: Props) {
  const form = useReportForm(registry, code)
  const { step, contract, fields } = form

  if (form.ticket) return <ReportTicket ticket={form.ticket} code={code} onOpen={onOpen} onRestart={form.restart} />

  return (
    <div className="bg-soft rounded-[2rem] p-24 md:p-40">
      <ReportStepper steps={formSteps} current={step} />
      {step === 0 && <ReportStepIssue registry={registry} code={code} category={fields.category} onCode={onCode} onCategory={(category) => form.set({ category })} />}
      {step === 1 && contract && <ReportStepStory contract={contract} form={form} />}
      {step === 2 && contract && <ReportReview contract={contract} {...fields} photoCount={form.photos.urls.length} reporter={form.reporter} />}
      {form.error && <div className="mt-24"><FormAlert>{form.error}</FormAlert></div>}
      <div className="items-center flex flex-wrap gap-20 justify-between mt-30">
        <BackButton onClick={() => form.setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Kembali</BackButton>
        {step < 2 ? (
          <PillButton tone="blue" onClick={() => form.setStep((s) => s + 1)} disabled={!form.canNext}>Lanjut</PillButton>
        ) : (
          <PillButton tone="blue" onClick={form.submit} disabled={form.sending || !contract?.apiId}>{form.sending ? 'Mengirim…' : 'Kirim laporan'}</PillButton>
        )}
      </div>
    </div>
  )
}
