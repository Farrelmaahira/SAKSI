import type { IllustrationName } from '@/data/illustrations'
import type { Counterparty, CounterpartyType, Village } from '@/interfaces/master'

export type TemplateKey = 'pengadaan' | 'hibah' | 'bumdes' | 'sewa'

/* How a contract type is shown and asked about in the wizard. */
export interface TemplateInfo {
  label: string
  desc: string
  art: IllustrationName
  partyTypes: CounterpartyType[]
  workLabel: string
  workPlaceholder: string
}

export interface Answers {
  work: string
  value: number
  deadline: string
  scheme: 'Sekaligus' | 'Termin'
  terms: number
  method: string
}

export interface Clause { key: string; title: string; text: string; plain: string; legal: string; legalReferenceId?: number }

export type ClauseSource = 'ai' | 'manual'

export interface Finding {
  id: string
  severity: 'kritis' | 'saran'
  title: string
  text: string
  clauseKey?: string
  fixable: boolean
  /* server findings: 'add' = the clause is missing and can be added from the template, 'edit' = the clause exists and has to be rewritten by hand */
  fix?: 'add' | 'edit'
  applied?: boolean
}

export interface Audit { at: string; score: number; findings: Finding[] }

export interface Ctx { village: Village; head: string; party: Counterparty }
