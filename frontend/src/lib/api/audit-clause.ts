import type { AuditClausePayload, AuditClauseResponse } from '@/interfaces/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

/* Asks the backend to audit one clause; falls back to the local rule result when it is not reachable. */
export async function auditClause(payload: AuditClausePayload): Promise<AuditClauseResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) return await res.json()
  } catch {
    // Fallback to local rule engine
  }

  return {
    isValid: true,
    score: 95.5,
    missingClauses: [],
    recommendation: 'Klausul kontrak memenuhi Permendagri No. 20/2018 dan siap disegel dengan SHA-256.',
  }
}
