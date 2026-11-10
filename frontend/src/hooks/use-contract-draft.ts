import { useState } from 'react'
import type { Answers, Audit, Clause, ClauseSource, TemplateKey } from '@/interfaces/drafting'
import { backendJenis } from '@/data/drafting'
import { fetchDraftOptions } from '@/lib/api/fetch-draft-options'
import { previewDraft } from '@/lib/api/preview-draft'
import { draftContext } from '@/lib/db/draft-context'
import { applyFinding } from '@/lib/drafting/apply-finding'
import { auditDraft } from '@/lib/drafting/audit-draft'
import { draftClauses } from '@/lib/drafting/draft-clauses'
import { reaudit } from '@/lib/drafting/reaudit'
import { wizardPayload } from '@/lib/drafting/wizard-payload'

interface Options {
  template: TemplateKey | null
  answers: Answers
  partyId: string
  regionId: string
  villageId?: string
  onAnswers: (a: Answers) => void
}

/* The clauses of the wizard: drafting (AI or manual), editing and the live audit. */
export function useContractDraft({ template, answers, partyId, regionId, villageId, onAnswers }: Options) {
  const [clauses, setClauses] = useState<Clause[]>([])
  const [audit, setAudit] = useState<Audit | null>(null)
  const [mode, setMode] = useState<ClauseSource>('ai')
  const [edited, setEdited] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [loadingTemplate, setLoadingTemplate] = useState(false)
  const [error, setError] = useState('')
  const [model, setModel] = useState<string | null>(null)

  const apply = (list: Clause[], source: ClauseSource) => {
    setClauses(list)
    setAudit(auditDraft(template!, answers, list, regionId))
    setMode(source)
    setEdited(false)
  }

  // AI mode: the backend drafts. On failure (e.g. 503 AI_UNAVAILABLE) we show the error, never a local stand-in; manual mode stays open.
  const draftWithAI = async () => {
    if (!template) return
    setThinking(true)
    setError('')
    setAudit(null)
    const r = await previewDraft(wizardPayload(template, answers, partyId))
    setThinking(false)
    if (!r.ok) return setError(r.code === 'AI_UNAVAILABLE' ? r.error : `Draf AI belum bisa dibuat. ${r.error}`)
    setModel(r.data.model)
    apply(r.data.clauses, 'ai')
  }

  // Manual mode: start from the mandatory clause template (clause_library) of this contract type
  const writeManual = async () => {
    if (!template) return
    setLoadingTemplate(true)
    const r = await fetchDraftOptions(backendJenis[template])
    setLoadingTemplate(false)
    // shortcut: an older backend sends no clauseTemplate (or cannot be reached), so the local template keeps manual mode usable; drop draftClauses here once every backend serves clauseTemplate
    const list = r.ok && r.data.clauseTemplate?.length ? r.data.clauseTemplate : draftClauses(template, answers, draftContext(villageId!, partyId))
    setError('')
    setModel(null)
    apply(list, 'manual')
  }

  const edit = (list: Clause[]) => {
    setClauses(list)
    setEdited(true)
    if (template) setAudit(reaudit(template, answers, list, regionId, audit ?? undefined))
  }

  const applySuggestion = (id: string) => {
    if (!template || !audit) return
    const out = applyFinding(template, answers, clauses, id)
    onAnswers(out.answers)
    setClauses(out.clauses)
    setEdited(true)
    setAudit(reaudit(template, out.answers, out.clauses, regionId, audit))
  }

  return {
    clauses,
    audit,
    mode,
    thinking,
    loadingTemplate,
    error,
    model,
    critical: audit?.findings.filter((f) => f.severity === 'kritis' && !f.applied).length ?? 0,
    // an AI draft a person changed is recorded as a manual version
    source: (mode === 'ai' && !edited ? 'ai' : 'manual') as ClauseSource,
    draftWithAI,
    writeManual,
    edit,
    applySuggestion,
  }
}
