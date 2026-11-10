'use client'

import ErrorText from '@/components/atoms/ErrorText'
import NotAllowed from '@/components/molecules/NotAllowed'
import PageHead from '@/components/molecules/PageHead'
import Panel from '@/components/molecules/Panel'
import WizardSteps from '@/components/molecules/WizardSteps'
import BuatKontrakDraf from '@/components/organisms/BuatKontrakDraf'
import BuatKontrakFooter from '@/components/organisms/BuatKontrakFooter'
import BuatKontrakJawaban from '@/components/organisms/BuatKontrakJawaban'
import BuatKontrakJenis from '@/components/organisms/BuatKontrakJenis'
import BuatKontrakPeriksa from '@/components/organisms/BuatKontrakPeriksa'
import BuatKontrakPihak from '@/components/organisms/BuatKontrakPihak'
import { useBuatKontrak } from '@/hooks/use-buat-kontrak'
import { buatKontrakSteps } from '@/data/dash'

export default function BuatKontrakTemplate() {
  const w = useBuatKontrak()
  const { step, t, template, draft } = w
  if (w.role.role !== 'perangkat_desa') return <NotAllowed />

  return (
    <>
      <PageHead label="Buat kontrak" title="Kontrak baru" desc="Jawab beberapa pertanyaan sederhana. SAKSI menyusun drafnya dan memeriksa dengan AI sebelum dikirim." />
      <WizardSteps steps={buatKontrakSteps} current={step} />
      <Panel className="gap-24 p-24">
        {step === 0 && <BuatKontrakJenis template={template} onPick={w.pickTemplate} />}
        {step === 1 && t && <BuatKontrakPihak info={t} choices={w.choices} partyId={w.partyId} onPick={w.setPartyId} inviting={w.inviteParty} />}
        {step === 2 && t && template && <BuatKontrakJawaban info={t} template={template} answers={w.answers} valueText={w.valueText} errors={w.errors} regionId={w.regionId} onChange={w.setAnswer} onValue={w.setValue} />}
        {step === 3 && t && template && <BuatKontrakDraf info={t} template={template} draft={draft} onRetry={draft.draftWithAI} onManual={w.writeManual} />}
        {w.reviewing && t && template && draft.audit && (
          <BuatKontrakPeriksa info={t} template={template} partyName={w.party?.name} partyId={w.partyId} villageId={w.role.villageId!} signerName={w.session.name} answers={w.answers} clauses={draft.clauses} audit={draft.audit} critical={draft.critical} letter={w.letter} />
        )}
        {w.errors.step && <ErrorText as="p">{w.errors.step}</ErrorText>}
        <BuatKontrakFooter
          step={step}
          busy={w.submitting}
          thinking={draft.thinking}
          loadingTemplate={draft.loadingTemplate}
          canNext={!draft.thinking && !(step === 3 && (draft.error || !draft.audit))}
          critical={draft.critical}
          onBack={w.back}
          onNext={w.next}
          onManual={w.writeManual}
          onFinish={w.finish}
        />
      </Panel>
    </>
  )
}
