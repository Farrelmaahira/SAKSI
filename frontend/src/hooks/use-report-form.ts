import { useState } from 'react'
import { useReportPhotos } from '@/hooks/use-report-photos'
import type { Report, SealedContract } from '@/interfaces/contract'
import { submitReport } from '@/lib/api/submit-report'
import { getSession } from '@/lib/auth/get-session'

const MIN_STORY = 15
const BLANK = { category: '', clause: '', text: '', location: '' }

/* State and actions of the public three-step report form. */
export function useReportForm(registry: SealedContract[], code: string) {
  const [step, setStep] = useState(0)
  const [fields, setFields] = useState(BLANK)
  const [anonymous, setAnonymous] = useState(true)
  const [name, setName] = useState(() => getSession()?.name ?? '')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [ticket, setTicket] = useState<Report | null>(null)
  const photos = useReportPhotos()

  const contract = registry.find((c) => c.code === code)
  const reporter = anonymous || !name.trim() ? 'Anonim' : name.trim()
  const set = (patch: Partial<typeof BLANK>) => setFields((f) => ({ ...f, ...patch }))

  // another contract has other clauses, so the picked clause no longer applies
  const [lastCode, setLastCode] = useState(code)
  if (code !== lastCode) {
    setLastCode(code)
    set({ clause: '' })
  }

  const canNext = step === 0 ? Boolean(fields.category && contract) : step === 1 ? Boolean(fields.clause && fields.text.trim().length >= MIN_STORY) : true

  const submit = async () => {
    if (!contract?.apiId) return
    setSending(true)
    setError('')
    const r = await submitReport({ contractId: contract.apiId, ...fields, photos: photos.files })
    setSending(false)
    if (!r.ok) return setError(r.status === 401 ? 'Masuk dengan akun warga untuk mengirim laporan.' : r.status === 403 ? 'Hanya akun warga terdaftar yang bisa mengirim laporan.' : r.error)
    setTicket({
      id: r.data.kodePelacakan,
      category: fields.category,
      clause: fields.clause,
      text: fields.text.trim(),
      location: fields.location.trim() || undefined,
      date: r.data.dibuatPada,
      status: 0,
      reporter,
      photos: photos.files.length,
    })
  }

  const restart = () => {
    setStep(0)
    setFields(BLANK)
    photos.clear()
    setError('')
    setAnonymous(true)
    setName('')
    setTicket(null)
  }

  return { step, setStep, fields, set, anonymous, setAnonymous, name, setName, reporter, contract, photos, canNext, sending, error, ticket, submit, restart, minStory: MIN_STORY }
}
