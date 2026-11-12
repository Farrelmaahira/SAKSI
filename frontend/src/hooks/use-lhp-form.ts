import { useState } from 'react'
import type { AuditReport, TerminListItem } from '@/interfaces/api'
import { createAuditReport } from '@/lib/api/create-audit-report'
import { newFinding, type FindingDraft } from '@/lib/lhp/new-finding'

const MIN_SUMMARY = 10
export const MAX_FINDINGS = 50

/* The form of a new LHP or uji petik: one contract, a summary, and up to 50 findings. */
export function useLhpForm(contracts: TerminListItem[], onCreated: (r: AuditReport) => void) {
  const [contractId, setContractId] = useState(contracts[0]?.contractId ?? 0)
  const [jenis, setJenis] = useState<'lhp' | 'uji_petik'>('lhp')
  const [ringkasan, setRingkasan] = useState('')
  const [findings, setFindings] = useState<FindingDraft[]>([newFinding()])
  const [terbit, setTerbit] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const patch = (i: number, p: Partial<FindingDraft>) => setFindings((f) => f.map((x, j) => (j === i ? { ...x, ...p } : x)))

  const save = async () => {
    if (!contractId) return setError('Pilih kontrak.')
    if (ringkasan.trim().length < MIN_SUMMARY) return setError('Tulis ringkasan minimal 10 karakter.')
    setBusy(true)
    setError('')
    const filled = findings.filter((f) => f.temuan.trim()).map((f) => ({ ...f, temuan: f.temuan.trim(), rekomendasi: f.rekomendasi.trim() }))
    const r = await createAuditReport({ contractId, jenis, ringkasan: ringkasan.trim(), terbit, findings: filled })
    setBusy(false)
    if (!r.ok) return setError(r.error)
    setRingkasan('')
    setFindings([newFinding()])
    setTerbit(false)
    onCreated(r.data)
  }

  return {
    contractId, setContractId, jenis, setJenis, ringkasan, setRingkasan, findings, patch, terbit, setTerbit, busy, error, save,
    addFinding: () => setFindings((x) => [...x, newFinding()]),
    removeFinding: (i: number) => setFindings((x) => x.filter((_, j) => j !== i)),
  }
}
