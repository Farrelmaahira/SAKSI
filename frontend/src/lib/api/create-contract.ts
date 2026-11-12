import type { ApiResult } from "@/interfaces/api";
import { apiRequest } from "@/lib/api/api-request";
import type {
  ContractDetailResponse,
  CreateContractPayload,
} from "@/lib/api/contracts";

/* POST /contracts: the draft of the wizard. A refusal keeps the server's own message. */
export const createContract = (
  payload: CreateContractPayload,
): Promise<ApiResult<ContractDetailResponse>> =>
  apiRequest<ContractDetailResponse>("/contracts", {
    method: "POST",
    body: payload,
  });
