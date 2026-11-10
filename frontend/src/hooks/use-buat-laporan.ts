import { useState } from 'react'
import { useDash } from '@/hooks/use-dash'
import { usePublicContract } from '@/hooks/use-public-contract'
import { usePublishedContracts } from '@/hooks/use-published-contracts'
import { useQueryParam } from '@/hooks/use-query-param'
import { useReportPhotos } from '@/hooks/use-report-photos'
import { submitReport } from '@/lib/api/submit-report'
import { homeFirst } from '@/lib/contracts/home-first'
import { validateReport } from '@/lib/reports/validate-report'
import { villageById } from '@/lib/master/village-by-id'

const BLANK = { category: '', clause: '', text: '', location: '' }

/* State and actions of the citizen's "Buat laporan" form; the components only render it. */
export function useBuatLaporan() {
  const { session } = useDash()
  const preset = useQueryParam('kontrak')
  const { registry, error: loadError } = usePublishedContracts()
  const photos = useReportPhotos()
  const [code, setCode] = useState('')
  const [fields, setFields] = useState(BLANK)
  const [tried, setTried] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [sent, setSent] = useState('')

  // Contracts of the citizen's own village come first
  const contracts = homeFirst(registry ?? [], villageById(session.role.villageId)?.name ?? '')
  const picked = contracts.find((c) => c.code === (code || preset) || String(c.apiId) === preset) ?? contracts[0]
  // the list has no clauses; the picked contract's published text supplies them
  const detail = usePublicContract(picked?.apiId)
  const contract = detail?.ok ? detail.data : picked
  const errors = validateReport(fields)

  const set = (patch: Partial<typeof BLANK>) => setFields((f) => ({ ...f, ...patch }))
  const pickContract = (c: string) => {
    setCode(c)
    set({ clause: '' })
  }

  const submit = async () => {
    setTried(true)
    if (!contract?.apiId || Object.values(errors).some(Boolean)) return
    setSending(true)
    setSendError('')
    const r = await submitReport({ contractId: contract.apiId, ...fields, photos: photos.files })
    setSending(false)
    if (!r.ok) return setSendError(r.status === 403 ? 'Hanya akun warga terdaftar yang bisa mengirim laporan.' : r.error)
    setSent(r.data.kodePelacakan)
  }

  const reset = () => {
    setFields(BLANK)
    photos.clear()
    setTried(false)
    setSendError('')
    setSent('')
  }

  return { role: session.role.role, registry, loadError, contracts, contract, detail, fields, set, pickContract, errors, tried, photos, sending, sendError, sent, submit, reset }
}
