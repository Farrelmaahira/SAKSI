import { useEffect, useState } from 'react'
import type { ApiResult, OversightAssignment, Pengawas } from '@/interfaces/api'
import { assignPengawas } from '@/lib/api/assign-pengawas'
import { listAssignments } from '@/lib/api/list-assignments'
import { listPengawas } from '@/lib/api/list-pengawas'
import { listPublicContracts } from '@/lib/api/list-public-contracts'
import type { PublicContractSummary } from '@/lib/api/reports'

const BLANK = { contractId: '', userId: '' }

/* Pengawas of the region, their contract assignments, and the form that adds an assignment. */
export function useAdminOversight() {
  const [pengawas, setPengawas] = useState<ApiResult<Pengawas[]> | null>(null)
  const [assigned, setAssigned] = useState<ApiResult<OversightAssignment[]> | null>(null)
  // shortcut: contract choices come from the public list (published or running), the only contract list an admin can read; upgrade when BE adds GET /admin/contracts
  const [contracts, setContracts] = useState<PublicContractSummary[]>([])
  const [reload, setReload] = useState(0)
  const [form, setForm] = useState(BLANK)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    listPengawas().then((r) => active && setPengawas(r))
    listPublicContracts().then((r) => active && r.ok && setContracts(r.data))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    listAssignments().then((r) => active && setAssigned(r))
    return () => {
      active = false
    }
  }, [reload])

  const people = pengawas?.ok ? pengawas.data : []

  const save = async () => {
    const who = people.find((p) => String(p.userId) === form.userId)
    if (!form.contractId || !who) return setError('Pilih kontrak dan pengawas.')
    setBusy(true)
    setError('')
    const r = await assignPengawas({ contractId: Number(form.contractId), pengawasUserId: who.userId, jenis: who.jenis })
    setBusy(false)
    if (!r.ok) return setError(r.error)
    setForm(BLANK)
    setReload((n) => n + 1)
  }

  return { pengawas, assigned, contracts, people, form, setForm, busy, error, save }
}
