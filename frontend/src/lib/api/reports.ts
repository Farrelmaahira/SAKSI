const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

export interface PublicContractSummary {
  id: number
  nomor: string
  judul: string
  jenis: string
  nilai: number
  tenggat: string
  status: string
  villageId: number
  villageName: string
  counterpartyNama: string
}

export interface PublicContractDetail extends PublicContractSummary {
  isiTeks: string
  klausulList: string[]
  integrityScore: number
  sha256Hash?: string
}

export interface ReportAttachmentResponse {
  fileId: number
  kunciPenyimpanan: string
  mime: string
  ukuran: number
  diunggahPada: string
}

export interface ReportActionResponse {
  id: number
  reportId: number
  aktorUserId: number
  aktorNama?: string
  tindakan: string
  catatan?: string
  diteruskanKeRole?: string
  waktu: string
}

export interface CreatedReportResponse {
  id: number
  contractId: number
  contractTitle?: string
  pelaporUserId: number
  pelaporNama?: string
  kodePelacakan: string
  kategori: string
  deskripsi: string
  lokasiLat?: number
  lokasiLng?: number
  status: string
  dibuatPada: string
  attachments?: ReportAttachmentResponse[]
  actions?: ReportActionResponse[]
}

export function getAuthToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('saksi:token') || ''
}

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('saksi:token', token)
}

export async function fetchPublicContracts(token?: string, search: string = ''): Promise<PublicContractSummary[]> {
  try {
    const activeToken = token || getAuthToken()
    const headers: Record<string, string> = {}
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`
    const query = search ? `?search=${encodeURIComponent(search)}` : ''
    const res = await fetch(`${API_BASE_URL}/public/contracts${query}`, { headers })
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn('Failed to fetch public contracts from API:', err)
  }
  return []
}

export async function fetchPublicContractDetail(id: number | string, token?: string): Promise<PublicContractDetail | null> {
  try {
    const activeToken = token || getAuthToken()
    const headers: Record<string, string> = {}
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`
    const res = await fetch(`${API_BASE_URL}/public/contracts/${id}`, { headers })
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn(`Failed to fetch public contract detail ${id}:`, err)
  }
  return null
}

export async function submitCitizenReport(formData: FormData, token?: string): Promise<CreatedReportResponse | null> {
  try {
    const activeToken = token || getAuthToken()
    const headers: Record<string, string> = {}
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers,
      body: formData,
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.error('Failed to submit citizen report:', err)
  }
  return null
}

export async function fetchMyReports(token?: string): Promise<CreatedReportResponse[]> {
  try {
    const activeToken = token || getAuthToken()
    const headers: Record<string, string> = {}
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`
    const res = await fetch(`${API_BASE_URL}/reports`, { headers })
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn('Failed to fetch citizen reports from API:', err)
  }
  return []
}

export async function fetchReportDetail(id: number | string, token?: string): Promise<CreatedReportResponse | null> {
  try {
    const activeToken = token || getAuthToken()
    const headers: Record<string, string> = {}
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`
    const res = await fetch(`${API_BASE_URL}/reports/${id}`, { headers })
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn(`Failed to fetch report detail ${id}:`, err)
  }
  return null
}
