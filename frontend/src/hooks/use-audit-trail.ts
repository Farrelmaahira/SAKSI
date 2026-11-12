import { useEffect, useState } from 'react'
import type { AuditLogItem } from '@/interfaces/api'
import type { AuditFilter } from '@/interfaces/dash'
import { listAuditLogs } from '@/lib/api/list-audit-logs'
import { auditKindOf } from '@/lib/dash/audit-kind-of'
import { auditLabelOf } from '@/lib/dash/audit-label-of'

interface Page {
  key: string
  items: AuditLogItem[]
  nextBefore: number | null
  error: string
  loading: boolean
}

const PAGE_SIZE = 50

/* The audit trail from GET /audit-logs: dates filter on the server, chips and search on the rows already loaded, older rows on request. */
export function useAuditTrail(allowed: boolean) {
  const [filter, setFilter] = useState<AuditFilter>('semua')
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState<Page | null>(null)
  const key = `${from}|${to}`

  useEffect(() => {
    if (!allowed) return
    let active = true
    listAuditLogs({ from, to, limit: PAGE_SIZE }).then((r) => {
      if (active) setPage({ key, items: r.ok ? (r.data.items ?? []) : [], nextBefore: r.ok ? r.data.nextBefore : null, error: r.ok ? '' : r.error, loading: false })
    })
    return () => {
      active = false
    }
  }, [allowed, from, to, key])

  const more = async () => {
    if (!page?.nextBefore) return
    setPage({ ...page, loading: true })
    const r = await listAuditLogs({ from, to, limit: PAGE_SIZE, before: page.nextBefore })
    setPage((p) => (p && p.key === key ? (r.ok ? { ...p, items: [...p.items, ...(r.data.items ?? [])], nextBefore: r.data.nextBefore, loading: false, error: '' } : { ...p, loading: false, error: r.error }) : p))
  }

  const current = page?.key === key ? page : null
  const loaded = current?.items ?? []
  const t = query.trim().toLowerCase()
  const list = loaded.filter((l) => (filter === 'semua' || auditKindOf(l) === filter) && (!t || [l.aktorNama, auditLabelOf(l), l.contractJudul, l.villageName].some((v) => v?.toLowerCase().includes(t))))
  const count = (k: AuditFilter) => (k === 'semua' ? loaded.length : loaded.filter((l) => auditKindOf(l) === k).length)

  return { filter, setFilter, query, setQuery, from, setFrom, to, setTo, current, loaded, list, count, more }
}
