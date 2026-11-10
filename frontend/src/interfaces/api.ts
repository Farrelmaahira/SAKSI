import type { Clause } from '@/interfaces/drafting'

export interface AuditClausePayload {
  contractId: string;
  clauseText: string;
  clauseType: string;
}

export interface AuditClauseResponse {
  isValid: boolean;
  score: number;
  missingClauses: string[];
  recommendation: string;
}

/* Every call in lib/api returns this instead of invented data: either the server's answer or an honest error. */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string; code?: string }

/* Clause shape shared with the backend (FE <-> BE JSON). legalReferenceId 0 = no legal basis. */
export interface ApiClause {
  kodePasal: string;
  judul: string;
  isi: string;
  urutan: number;
  legalReferenceId: number;
}

export interface ApiFinding {
  kodePasal: string;
  tingkat: 'kritis' | 'saran';
  pesan: string;
}

export interface ContractAudit {
  findings: ApiFinding[];
  skor: number;
  model: string;
}

export interface LegalReference {
  id: number;
  peraturan: string;
  nomorPasal: string;
  isi: string;
}

/* GET /contracts/options?jenis=: null = the backend did not send that field (older backend) */
export interface DraftOptions {
  legalReferences: LegalReference[] | null;
  clauseTemplate: Clause[] | null;
}

/* POST /contracts/{id}/publish: the text citizens see, after the AI engine removed personal data */
export interface Publication {
  id: number;
  contractId: number;
  versionId: number;
  isiTersaring: string;
  redactedKinds: string[] | null;
  waktu: string;
}
