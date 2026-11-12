import { useEffect, useState } from 'react'
import type { ApiResult, RegionRule } from '@/interfaces/api'
import { createRegionRule } from '@/lib/api/create-region-rule'
import { listRegionRules } from '@/lib/api/list-region-rules'
import { validateRegionRule, type RegionRuleForm } from '@/lib/admin/validate-region-rule'

const BLANK: RegionRuleForm = { langsung: '', penawaran: '', dasar: '', sejak: '' }

/* Procurement thresholds of the region and the form that adds a new rule (a new row; history stays). */
export function useRegionRules() {
  const [rules, setRules] = useState<ApiResult<RegionRule[]> | null>(null)
  const [reload, setReload] = useState(0)
  const [form, setForm] = useState(BLANK)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    listRegionRules().then((r) => active && setRules(r))
    return () => {
      active = false
    }
  }, [reload])

  const save = async () => {
    const checked = validateRegionRule(form)
    if ('error' in checked) return setError(checked.error)
    setBusy(true)
    setError('')
    const r = await createRegionRule({ ambangPembelianLangsung: checked.langsung, ambangPenawaran: checked.penawaran, dasarHukum: form.dasar.trim(), berlakuSejak: form.sejak })
    setBusy(false)
    if (!r.ok) return setError(r.error)
    setForm(BLANK)
    setReload((n) => n + 1)
  }

  const set = (patch: Partial<RegionRuleForm>) => setForm((f) => ({ ...f, ...patch }))
  return { rules, form, set, busy, error, save }
}
