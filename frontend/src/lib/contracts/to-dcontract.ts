import type { ContractAudit } from '@/interfaces/api'
import type { UserRole } from '@/interfaces/auth'
import type { DContract, Review, Version } from '@/interfaces/db'
import type { Answers, Audit, Clause, TemplateKey } from '@/interfaces/drafting'
import type { ContractLifecycleResponse, ContractVersionItem } from '@/lib/api/contracts'
import { clausesFromText } from '@/lib/api/clauses-from-text'
import { backendJenis } from '@/data/drafting'
import { toContractStatus } from '@/lib/contracts/to-contract-status'
import { villageById } from '@/lib/master/village-by-id'

const asClauses = (v: ContractVersionItem): Clause[] => {
  const saved = v.jawabanForm?.clauses
  if (Array.isArray(saved)) return saved.map((c, i) => ({ key: String(c.key ?? `P-${i + 1}`), title: String(c.title ?? ''), text: String(c.text ?? ''), plain: '', legal: '' }))
  return clausesFromText(v.isi).map((c, i) => ({ key: `P-${i + 1}`, title: c.title, text: c.text, plain: '', legal: '' }))
}

/* The answers the server kept for this version, with the contract's own fields as the floor. */
const asAnswers = (l: ContractLifecycleResponse, v: ContractVersionItem): Answers => {
  const k = l.contract
  const f = (v.jawabanForm ?? {}) as Partial<Answers>
  return {
    work: f.work ?? k.judul,
    value: f.value ?? k.nilai,
    deadline: f.deadline ?? k.tenggat,
    scheme: f.scheme ?? (k.skemaPembayaran === 'termin' ? 'Termin' : 'Sekaligus'),
    terms: f.terms ?? 2,
    method: f.method ?? 'Pengadaan langsung',
  }
}

/* A contract the server returned (lifecycle + latest audit) in the shape the dashboard works with.
   `code` is the contract number the user followed to get here, so the route finds the contract again. The server already scoped it to this user, so the parties are tied to the signed-in role instead of ids the browser may not know. */
export function toDContract(l: ContractLifecycleResponse, audit: ContractAudit | null, role: UserRole, code?: string): DContract {
  const k = l.contract
  const template = (Object.keys(backendJenis) as TemplateKey[]).find((t) => backendJenis[t] === k.jenis) ?? 'pengadaan'
  const latest = l.currentVersion.nomorVersi
  const auditOf = (v: ContractVersionItem): Audit => ({
    at: v.createdAt,
    score: v.nomorVersi === latest && audit ? audit.skor : k.integrityScore,
    findings: v.nomorVersi === latest && audit ? audit.findings.map((f, i) => ({ id: `${f.kodePasal}-${i}`, severity: f.tingkat, title: f.kodePasal, text: f.pesan, clauseKey: f.kodePasal, fixable: false })) : [],
  })
  const versions: Version[] = l.versions.map((v) => ({ no: v.nomorVersi, at: v.createdAt, answers: asAnswers(l, v), clauses: asClauses(v), audit: auditOf(v), source: v.sumber === 'ai' ? 'ai' : 'manual' }))
  const reviews: Review[] = l.reviews.map((r) => ({
    id: String(r.id),
    versionNo: l.versions.find((v) => v.id === r.versionId)?.nomorVersi ?? latest,
    clauseKey: '',
    author: k.counterpartyNama ?? 'Pihak kedua',
    role: 'pihak_kedua',
    text: r.komentar,
    at: r.waktu,
    resolved: r.status === 'selesai',
    replies: [],
  }))
  return {
    code: code || `SKS-2026-${String(k.id).padStart(3, '0')}`,
    apiId: k.id,
    villageId: k.villageId ? villageById(k.villageId)!.id : (role.villageId ?? ''),
    template,
    title: k.judul,
    counterpartyId: role.role === 'pihak_kedua' ? (role.counterpartyId ?? '') : String(k.counterpartyId ?? ''),
    status: toContractStatus(k.status),
    createdAt: k.createdAt.slice(0, 10),
    versions,
    reviews,
    signatures: {},
    seals: l.seal ? [{ hash: l.seal.sha256, at: l.seal.waktuSegel, prev: null, versionNo: latest }] : [],
    terms: [],
    progress: [],
    history: [{ status: toContractStatus(k.status), at: k.createdAt, by: 'Server' }],
    selfReport: false,
  }
}
