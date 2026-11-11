import { useRef, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePublicContract } from '@/hooks/use-public-contract'
import { usePublishedContracts } from '@/hooks/use-published-contracts'
import { useSealLookup } from '@/hooks/use-seal-lookup'
import { findContract } from '@/lib/contracts/find-contract'

/* State and actions of the public "Lacak kontrak" page: search, the opened contract and the report picker. */
export function useLacak() {
  const router = useRouter()
  const q = useSearchParams().get('q') ?? ''
  const { registry: loaded, error, loading } = usePublishedContracts()
  const list = loaded ?? []
  const seal = useSealLookup(q)
  const [input, setInput] = useState(q)
  const [reportCode, setReportCode] = useState('')
  const resultRef = useRef<HTMLElement>(null)
  const reportRef = useRef<HTMLElement>(null)

  // the search box follows the address bar (back/forward, links)
  const [lastQ, setLastQ] = useState(q)
  if (q !== lastQ) {
    setLastQ(q)
    setInput(q)
  }

  // codes and ids match the loaded list; a sealed hash matches the contract the server named
  const found = list.find((c) => String(c.apiId) === q || (seal.contractId !== undefined && c.apiId === seal.contractId)) ?? findContract(list, q)
  // the opened contract and the one picked for a report get their full published text (clauses, hash)
  const foundDetail = usePublicContract(found?.apiId)
  const reportDetail = usePublicContract(list.find((c) => c.code === reportCode)?.apiId)
  const registry = list.map((c) => (reportDetail?.ok && reportDetail.data.code === c.code ? reportDetail.data : c))

  // the report picker follows the opened contract, and starts on the first one
  const syncKey = `${found?.code ?? ''}|${registry.length}`
  const [lastSync, setLastSync] = useState('')
  if (syncKey !== lastSync) {
    setLastSync(syncKey)
    if (found) setReportCode(found.code)
    else if (!reportCode && registry[0]) setReportCode(registry[0].code)
  }

  const setQuery = (value: string) => router.push(value ? `/lacak?q=${encodeURIComponent(value)}` : '/lacak', { scroll: false })
  const scrollToResult = () => requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))

  const open = (code: string) => {
    setQuery(code)
    scrollToResult()
  }

  const search = (e: FormEvent) => {
    e.preventDefault()
    const value = input.trim()
    setQuery(value)
    if (value) scrollToResult()
  }

  const goReport = () => {
    if (found) setReportCode(found.code)
    reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return {
    q, input, setInput, registry, resultRef, reportRef, reportCode, setReportCode, open, search, goReport,
    loading: loading || seal.pending || (Boolean(found) && !foundDetail),
    error: error || (foundDetail?.ok === false ? foundDetail.error : ''),
    found: foundDetail?.ok ? foundDetail.data : undefined,
    reportError: reportDetail?.ok === false ? reportDetail.error : '',
  }
}
