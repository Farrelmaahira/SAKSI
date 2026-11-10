'use client'

import { useEffect, useState } from 'react'
import { useDash } from '@/hooks/use-dash'
import type { ApiResult, TerminListItem } from '@/interfaces/api'
import { listTermin } from '@/lib/api/list-termin'
import NotAllowed from '@/components/molecules/NotAllowed'
import PageHead from '@/components/molecules/PageHead'
import FormAlert from '@/components/atoms/FormAlert'
import PihakTermin from '@/components/organisms/PihakTermin'
import InspTermin from '@/components/organisms/InspTermin'

export default function TerminTemplate() {
  const { session } = useDash()
  const r = session.role.role
  const [res, setRes] = useState<ApiResult<TerminListItem[]> | null>(null)
  const allowed = r === 'pihak_kedua' || r === 'inspektorat'

  useEffect(() => {
    if (!allowed) return
    let active = true
    listTermin().then((x) => active && setRes(x))
    return () => {
      active = false
    }
  }, [allowed])

  if (!allowed) return <NotAllowed />
  if (!res || !res.ok)
    return (
      <>
        <PageHead label="Termin" title={r === 'pihak_kedua' ? 'Termin pembayaran' : 'Termin dibanding progres fisik'} />
        {res ? <FormAlert>{res.error}</FormAlert> : <p className="text-[1.4rem] text-dim" role="status">Memuat termin…</p>}
      </>
    )
  return r === 'pihak_kedua' ? <PihakTermin rows={res.data} /> : <InspTermin rows={res.data} />
}
