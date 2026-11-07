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
}

export interface CreatedReportResponse {
  id: number
  contractId: number
  contractTitle?: string
  pelaporUserId: number
  kodePelacakan: string
  kategori: string
  deskripsi: string
  status: string
  dibuatPada: string
}

export async function fetchPublicContracts(token?: string, search: string = ''): Promise<PublicContractSummary[]> {
  try {
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const query = search ? `?search=${encodeURIComponent(search)}` : ''
    const res = await fetch(`${API_BASE_URL}/public/contracts${query}`, { headers })
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn('Failed to fetch public contracts from API, using fallback:', err)
  }
  return []
}

export async function fetchPublicContractDetail(id: number | string, token?: string): Promise<PublicContractDetail | null> {
  try {
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${API_BASE_URL}/public/contracts/${id}`, { headers })
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn(`Failed to fetch public contract detail ${id}:`, err)
  }
  return null
}

export async function submitCitizenReport(formData: FormData, token: string): Promise<CreatedReportResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

export async function fetchMyReports(token: string): Promise<CreatedReportResponse[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn('Failed to fetch citizen reports from API:', err)
  }
  return []
}

