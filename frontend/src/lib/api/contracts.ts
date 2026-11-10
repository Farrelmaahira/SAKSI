import { getAuthToken } from "./reports";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export interface ContractOptionItem {
  value: string;
  label: string;
  description?: string;
}

export interface ContractOptionsResponse {
  jenisKontrak: ContractOptionItem[];
  metodePemilihan: ContractOptionItem[];
  skemaPembayaran: ContractOptionItem[];
}

export interface CounterpartyResponse {
  id: number;
  userId?: number;
  nama: string;
  jenis: string;
  npwp?: string;
  alamat?: string;
}

export interface WizardPreviewPayload {
  counterpartyId: number;
  jenis: string;
  judul: string;
  nilai: number;
  tenggat: string;
  skemaPembayaran: string;
  metodePemilihan: string;
  jawabanForm: Record<string, any>;
  drafTeksOverride?: string;
}

export interface WizardPreviewResponse {
  judul: string;
  jenis: string;
  nilai: number;
  teksDraf: string;
  sha256Hash: string;
  integrityScore: number;
  mandatoryFulfilled: number;
  totalMandatory: number;
  summary: string;
}

export interface CreateContractPayload {
  counterpartyId: number;
  jenis: string;
  judul: string;
  nilai: number;
  tenggat: string;
  skemaPembayaran: string;
  metodePemilihan: string;
  jawabanForm: Record<string, any>;
  drafTeksOverride?: string;
}

export interface ContractDetailResponse {
  id: number;
  villageId?: number;
  villageName?: string;
  counterpartyId?: number;
  counterpartyNama?: string;
  jenis: string;
  judul: string;
  nilai: number;
  tenggat: string;
  skemaPembayaran?: string;
  metodePemilihan?: string;
  status: string;
  nomorVersi: number;
  teksKontrak?: string;
  jawabanForm?: Record<string, any>;
  integrityScore: number;
  sha256Hash: string;
  createdBy: number;
  createdAt: string;
}

export interface ContractListItem {
  id: string;
  contractNumber: string;
  villageId: string;
  villageName: string;
  title: string;
  category: string;
  vendorName: string;
  amount: number;
  status: string;
  sha256Hash: string;
  integrityScore: number;
  rating: number;
  volume: string;
  fiscalYear: number;
  clausesCount: number;
  mandatoryFulfilled: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractVersionItem {
  id: number;
  contractId: number;
  nomorVersi: number;
  jawabanForm?: Record<string, any>;
  isi: string;
  sumber: string;
  createdBy: number;
  createdAt: string;
}

export interface ContractReviewItem {
  id: number;
  versionId: number;
  partyId: number;
  clauseId?: number;
  komentar: string;
  status: string;
  waktu: string;
}

export interface SignatureItem {
  id: number;
  versionId: number;
  partyId: number;
  signerUserId: number;
  metode: string;
  referensi: string;
  waktu: string;
}

export interface DocumentSealItem {
  id: number;
  versionId: number;
  fileId: number;
  sha256: string;
  waktuSegel: string;
  segelSebelumnyaId?: number;
  chain?: string;
  txHash?: string;
}

export interface ContractLifecycleResponse {
  contract: ContractDetailResponse;
  currentVersion: ContractVersionItem;
  versions: ContractVersionItem[];
  reviews: ContractReviewItem[];
  signatures: SignatureItem[];
  seal?: DocumentSealItem;
}

export interface SignContractResponse {
  signature: SignatureItem;
  seal?: DocumentSealItem;
  isSealed: boolean;
  message: string;
}

export interface DashboardMetricsResponse {
  activeContractsCount: number;
  activeContractsChange: number;
  totalRealizationBudget: number;
  realizationChange: number;
  pendingReviewCount: number;
  pendingReviewChange: number;
  sealedContractsCount: number;
  sealedContractsChange: number;
  integrityIndex: number;
}

// -------------------------------------------------------------
// API Client Functions
// -------------------------------------------------------------

export async function fetchContractOptions(): Promise<ContractOptionsResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/options`, {
      headers: authHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Failed to fetch contract options:", err);
  }
  return null;
}

export async function fetchCounterparties(
  jenis?: string,
  search: string = "",
): Promise<CounterpartyResponse[]> {
  try {
    const params = new URLSearchParams();
    if (jenis) params.set("jenis", jenis);
    if (search) params.set("search", search);
    const qs = params.toString() ? `?${params.toString()}` : "";

    const res = await fetch(`${API_BASE_URL}/counterparties${qs}`, {
      headers: authHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Failed to fetch counterparties:", err);
  }
  return [];
}

export async function previewContractWizard(
  payload: WizardPreviewPayload,
): Promise<WizardPreviewResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/wizard/preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Failed to generate wizard preview:", err);
  }
  return null;
}

export async function createContractAPI(
  payload: CreateContractPayload,
): Promise<ContractDetailResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Failed to create contract on API:", err);
  }
  return null;
}

export async function fetchContractsAPI(
  query: string = "",
): Promise<ContractListItem[]> {
  try {
    const qs = query ? `?q=${encodeURIComponent(query)}` : "";
    const res = await fetch(`${API_BASE_URL}/contracts${qs}`, {
      headers: authHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Failed to fetch contracts:", err);
  }
  return [];
}

export async function fetchContractDetailAPI(
  id: number | string,
): Promise<ContractDetailResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/${id}`, {
      headers: authHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn(`Failed to fetch contract ${id}:`, err);
  }
  return null;
}

export async function fetchContractLifecycleAPI(
  id: number | string,
): Promise<ContractLifecycleResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/${id}/lifecycle`, {
      headers: authHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn(`Failed to fetch lifecycle for contract ${id}:`, err);
  }
  return null;
}

export async function reviseContractAPI(
  id: number | string,
  jawabanForm: Record<string, any>,
  drafTeksOverride?: string,
): Promise<ContractVersionItem | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ jawabanForm, drafTeksOverride }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error(`Failed to revise contract ${id}:`, err);
  }
  return null;
}

export async function submitContractReviewAPI(
  id: number | string,
  payload: {
    clauseId?: number;
    komentar: string;
    status: "setuju" | "minta_revisi";
  },
): Promise<ContractReviewItem | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/${id}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error(`Failed to submit review for contract ${id}:`, err);
  }
  return null;
}

export async function signContractAPI(
  id: number | string,
  payload: FormData | { metode?: string; referensi?: string },
): Promise<SignContractResponse | null> {
  try {
    const isFormData =
      typeof FormData !== "undefined" && payload instanceof FormData;
    const headers: Record<string, string> = {
      ...authHeaders(),
    };
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE_URL}/contracts/${id}/sign`, {
      method: "POST",
      headers,
      body: isFormData ? payload : JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error(`Failed to sign contract ${id}:`, err);
  }
  return null;
}

export async function fetchDashboardMetricsAPI(): Promise<DashboardMetricsResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/metrics`, {
      headers: authHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Failed to fetch dashboard metrics:", err);
  }
  return null;
}
