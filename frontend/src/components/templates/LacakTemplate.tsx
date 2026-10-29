'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ReportSection from '@/components/organisms/ReportSection'
import TrackHero from '@/components/organisms/TrackHero'
import TrackResults from '@/components/organisms/TrackResults'
import VerifySection from '@/components/organisms/VerifySection'
import { useReveal } from '@/hooks/use-reveal'
import type { SealedContract } from '@/interfaces/contract'
import { findContract } from '@/lib/contracts/find-contract'
import { loadRegistry } from '@/lib/contracts/load-registry'

export default function LacakTemplate() {
  useReveal()
  const router = useRouter()
  const params = useSearchParams()
  const q = params.get('q') ?? ''
  const [input, setInput] = useState(q)
  const [registry, setRegistry] = useState<SealedContract[]>([])
  const [loading, setLoading] = useState(true)
  const [reportCode, setReportCode] = useState('')
  const resultRef = useRef<HTMLElement>(null)
  const reportRef = useRef<HTMLElement>(null)

  const reload = () =>
    loadRegistry().then((list) => {
      setRegistry(list)
      setLoading(false)
    })

  useEffect(() => {
    reload()
  }, [])

  const [lastQ, setLastQ] = useState(q)
  if (q !== lastQ) {
    setLastQ(q)
    setInput(q)
  }

  const found = findContract(registry, q)

  // Follow the opened contract in the report form, or default to the first one once the registry loads.
  const syncKey = `${found?.code ?? ''}|${registry.length}`
  const [lastSync, setLastSync] = useState('')
  if (syncKey !== lastSync) {
    setLastSync(syncKey)
    if (found) setReportCode(found.code)
    else if (!reportCode && registry[0]) setReportCode(registry[0].code)
  }

  // Pushes ?q= without jumping to the top, like the old react-router setSearchParams.
  const setQuery = (value: string) => router.push(value ? `/lacak?q=${encodeURIComponent(value)}` : '/lacak', { scroll: false })

  const open = (code: string) => {
    setQuery(code)
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    const value = input.trim()
    setQuery(value)
    if (value) requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const goReport = () => {
    if (found) setReportCode(found.code)
    reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main>
      <TrackHero registry={registry} input={input} onInput={setInput} onSearch={onSearch} onOpen={open} />
      <TrackResults ref={resultRef} registry={registry} loading={loading} query={q} found={found} onOpen={open} onReport={goReport} />
      <VerifySection registry={registry} onOpen={open} />
      <ReportSection ref={reportRef} registry={registry} code={reportCode} onCode={setReportCode} onSubmitted={() => reload()} onOpen={open} />
    </main>
  )
}
