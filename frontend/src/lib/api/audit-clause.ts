import type { AuditClausePayload, AuditClauseResponse } from "@/interfaces/api";
import { apiRequest } from "@/lib/api/api-request";

/* Asks the backend to audit one clause. No local fallback: a failure is returned as an error, never as a passing score. */
export const auditClause = (payload: AuditClausePayload) =>
  apiRequest<AuditClauseResponse>("/contracts/audit", {
    method: "POST",
    body: payload,
  });
