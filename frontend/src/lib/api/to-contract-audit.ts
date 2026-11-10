import type { ContractAudit } from '@/interfaces/api'

/* Untrusted audit JSON -> ContractAudit, or null when skor/findings are missing. */
export function toContractAudit(raw: unknown): ContractAudit | null {
  const d = (raw ?? {}) as Record<string, unknown>
  if (typeof d.skor !== 'number' || !Array.isArray(d.findings)) return null
  return {
    skor: d.skor,
    model: String(d.model ?? ''),
    findings: d.findings.map((f) => {
      const x = (f ?? {}) as Record<string, unknown>
      // fail closed: an unknown severity is shown as critical, never silently downgraded
      return { kodePasal: String(x.kodePasal ?? ''), tingkat: x.tingkat === 'saran' ? 'saran' : 'kritis', pesan: String(x.pesan ?? '') }
    }),
  }
}
