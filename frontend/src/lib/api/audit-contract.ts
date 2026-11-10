import type { ApiResult, ContractAudit } from "@/interfaces/api";
import { apiRequest } from "@/lib/api/api-request";
import { toContractAudit } from "@/lib/api/to-contract-audit";

/* POST /contracts/{id}/audit: audits the latest version (AI or manual). */
export async function auditContract(
  id: number,
): Promise<ApiResult<ContractAudit>> {
  const r = await apiRequest<unknown>(`/contracts/${id}/audit`, {
    method: "POST",
  });
  if (!r.ok) return r;
  const audit = toContractAudit(r.data);
  return audit
    ? { ok: true, data: audit }
    : {
        ok: false,
        status: 200,
        error: "Jawaban audit dari server tidak lengkap. Coba audit ulang.",
      };
}
