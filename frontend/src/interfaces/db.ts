import type { Answers, Audit, Clause, TemplateKey } from '@/interfaces/drafting'
import type { RoleKey } from '@/interfaces/auth'
import { pubFields } from '@/data/db'

export type ContractStatus = 'draf' | 'diaudit' | 'ditinjau' | 'ditandatangani' | 'dipublikasikan' | 'berjalan' | 'selesai'

export interface Version { no: number; at: string; answers: Answers; clauses: Clause[]; audit: Audit; note?: string }

export interface ReviewReply { author: string; role: RoleKey; text: string; at: string }

export interface Review { id: string; versionNo: number; clauseKey: string; author: string; role: RoleKey; text: string; at: string; resolved?: boolean; replies: ReviewReply[] }

export interface Signature { by: string; at: string }

export interface Seal { hash: string; at: string; prev: string | null; versionNo: number }

export interface Term { no: number; label: string; percent: number; amount: number; planDate: string; paidDate?: string }

export interface ProgressEntry { id: string; percent: number; note: string; at: string; by: string; role: RoleKey; photos: number }

export type PubField = (typeof pubFields)[number]

export interface DContract {
  code: string
  villageId: string
  template: TemplateKey
  title: string
  counterpartyId: string
  status: ContractStatus
  createdAt: string
  versions: Version[]
  reviewDecision?: 'setuju' | 'revisi'
  reviewNote?: string
  reviews: Review[]
  signatures: { desa?: Signature; pihak?: Signature; meterai?: { serial: string; at: string } }
  seals: Seal[]
  spk?: { number: string; date: string; start: string; end: string }
  terms: Term[]
  progress: ProgressEntry[]
  publication?: { at: string; fields: PubField[] }
  history: { status: ContractStatus; at: string; by: string }[]
  selfReport: boolean
}

export type ReportFlow = 'baru' | 'diverifikasi' | 'diteruskan' | 'ditindaklanjuti' | 'ditutup'

export type ActionKind = 'tanggapan' | 'klarifikasi' | 'verifikasi' | 'eskalasi' | 'selesai' | 'tindak_lanjut' | 'tutup'

export interface ReportAction { id: string; at: string; by: string; role: RoleKey; kind: ActionKind; text: string }

export interface DReport {
  id: string
  contractCode: string
  category: string
  clause: string
  text: string
  location?: string
  date: string
  reporter: string
  photos: number
  flow: ReportFlow
  actions: ReportAction[]
}

export interface Db { contracts: DContract[]; reports: DReport[] }
