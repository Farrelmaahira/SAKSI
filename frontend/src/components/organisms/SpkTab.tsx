'use client'

import Btn from '@/components/atoms/Btn'
import Hint from '@/components/atoms/Hint'
import Empty from '@/components/molecules/Empty'
import Panel from '@/components/molecules/Panel'
import SummaryList from '@/components/molecules/SummaryList'
import TerminState from '@/components/molecules/TerminState'
import SpkForm from '@/components/organisms/SpkForm'
import { useContractTermin } from '@/hooks/use-contract-termin'
import { useSpkForm } from '@/hooks/use-spk-form'
import type { TabProps } from '@/interfaces/dash'
import { signedOrLater } from '@/lib/dash/signed-or-later'
import { fmtDate } from '@/lib/dates/fmt-date'

export default function SpkTab({ c: local, session }: TabProps) {
  const t = useContractTermin(local)
  const c = t.c
  const spk = useSpkForm(c, session, t.reload)
  const isDesa = session.role.role === 'perangkat_desa'

  if (t.server && !t.result?.ok) return <TerminState result={t.result} />
  if (!signedOrLater(c.status)) return <Empty art="contract-signed_vutk" title="SPK diterbitkan setelah kontrak ditandatangani." />

  return (
    <Panel title="Surat Perintah Kerja" desc="SPK menandai pekerjaan resmi dimulai. Setelah kontrak dipublikasikan dan SPK terbit, status menjadi Berjalan.">
      {isDesa && (spk.editing || !c.spk) ? (
        <SpkForm c={c} spk={spk} />
      ) : c.spk ? (
        <>
          <SummaryList rows={[['Nomor', c.spk.number], ['Tanggal', fmtDate(c.spk.date)], ['Mulai', fmtDate(c.spk.start)], ['Selesai', fmtDate(c.spk.end)]]} />
          {isDesa && c.status !== 'selesai' && <Btn small variant="ghost" onClick={spk.edit}>Ubah SPK</Btn>}
        </>
      ) : (
        <Hint>SPK belum diterbitkan desa.</Hint>
      )}
    </Panel>
  )
}
