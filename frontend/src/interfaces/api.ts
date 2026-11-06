export interface AuditClausePayload {
  contractId: string
  clauseText: string
  clauseType: string
}

export interface AuditClauseResponse {
  isValid: boolean
  score: number
  missingClauses: string[]
  recommendation: string
}
