'use client'

import FormAlert from '@/components/atoms/FormAlert'
import Hint from '@/components/atoms/Hint'
import Btn from '@/components/atoms/Btn'
import Locked from '@/components/atoms/Locked'
import Panel from '@/components/molecules/Panel'
import TerminState from '@/components/molecules/TerminState'
import TerminSummary from '@/components/organisms/TerminSummary'
import TerminTable from '@/components/organisms/TerminTable'
import { useContractTermin } from '@/hooks/use-contract-termin'
import { useTerminActions } from '@/hooks/use-termin-actions'
import type { TabProps } from '@/interfaces/dash'

export default function TerminTab({ c: local, session }: TabProps) {
  const t = useContractTermin(local)
  const c = t.c
  const actions = useTerminActions(c, t.reload)
  const isDesa = session.role.role === 'perangkat_desa'
  const canPay = isDesa && (c.status === 'berjalan' || c.status === 'selesai')

  if (t.server && !t.result?.ok) return <TerminState result={t.result} />
  return (
    <div className="grid gap-20 [&>*]:min-w-0">
      <TerminSummary c={c} />
      <Panel title="Jadwal termin">
        <TerminTable c={c} canPay={canPay} busy={actions.busy} onPay={actions.pay} />
        {t.server && !c.terms.length &&
          (isDesa ? (
            <div className="grid gap-10 justify-items-start">
              <Hint>Jadwal termin belum dibuat di server. Buat dari skema pembayaran di rancangan kontrak.</Hint>
              <Btn small onClick={actions.createSchedule} disabled={actions.busy}>{actions.busy ? 'Menyimpan…' : 'Buat jadwal termin'}</Btn>
            </div>
          ) : (
            <Hint>Desa belum membuat jadwal termin.</Hint>
          ))}
        {actions.error && <FormAlert>{actions.error}</FormAlert>}
        {isDesa && !canPay && <Locked text="Termin bisa dibayar setelah SPK terbit dan kontrak berjalan." />}
      </Panel>
    </div>
  )
}
