'use client'

import Btn from '@/components/atoms/Btn'
import Activity from '@/components/molecules/Activity'
import ActivityFeed from '@/components/molecules/ActivityFeed'
import NextStepBanner from '@/components/molecules/NextStepBanner'
import Panel from '@/components/molecules/Panel'
import StageTimeline from '@/components/molecules/StageTimeline'
import TextButton from '@/components/atoms/TextButton'
import ContractDataPanel from '@/components/organisms/ContractDataPanel'
import ExecutionPanel from '@/components/organisms/ExecutionPanel'
import { whoLabel } from '@/data/dash'
import type { TabProps } from '@/interfaces/dash'
import { nextStep } from '@/lib/db/next-step'

export default function RingkasanTab({ c, session, go }: TabProps) {
  const step = nextStep(c)
  const mine = step?.who === session.role.role

  return (
    <div className="grid gap-20 [&>*]:min-w-0">
      {step ? (
        <NextStepBanner
          tone={mine ? 'mine' : 'waiting'}
          icon={mine ? 'arrow' : 'clock'}
          title={mine ? 'Langkah berikutnya untuk Anda' : `Menunggu ${whoLabel[step.who].toLowerCase()}`}
          action={<Btn variant={mine ? 'light' : 'ghost'} onClick={() => go(step.tab)}>{mine ? 'Kerjakan' : 'Lihat'}</Btn>}
        >
          {step.text}
        </NextStepBanner>
      ) : (
        <NextStepBanner tone="done" icon="check" title="Kontrak selesai">
          Semua tahap sudah dilalui. Dokumen tetap bisa diperiksa warga.
        </NextStepBanner>
      )}
      <Panel title="Tahapan kontrak">
        <StageTimeline c={c} />
      </Panel>
      <div className="items-stretch grid gap-20 lg:grid-cols-[repeat(2,minmax(0,1fr))] [&>*]:min-w-0">
        <ContractDataPanel c={c} />
        <ExecutionPanel c={c} />
      </div>
      <Panel title="Aktivitas terakhir" action={<TextButton onClick={() => go('riwayat')}>Riwayat lengkap</TextButton>}>
        {c.apiId ? <ActivityFeed limit={5} contractId={c.apiId} /> : <Activity logs={[]} empty="Kontrak contoh ini hanya ada di perangkat ini, jadi belum punya jejak di server." />}
      </Panel>
    </div>
  )
}
