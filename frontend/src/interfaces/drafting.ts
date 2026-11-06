import type { Counterparty, Village } from '@/interfaces/master'

export type TemplateKey = 'pengadaan' | 'hibah' | 'bumdes' | 'sewa'

export interface Answers {
  work: string
  value: number
  deadline: string
  scheme: 'Sekaligus' | 'Termin'
  terms: number
  method: string
}

export interface Clause { key: string; title: string; text: string; plain: string; legal: string }

export interface Finding {
  id: string
  severity: 'kritis' | 'saran'
  title: string
  text: string
  clauseKey?: string
  fixable: boolean
  applied?: boolean
}

export interface Audit { at: string; score: number; findings: Finding[] }

export interface Ctx { village: Village; head: string; party: Counterparty }
