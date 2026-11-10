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
  /* plan section 7.10: work and payment summary without notes or reporter names */
  progres?: {
    persenTerakhir: number
    terakhirDilaporkan: string | null
    spkMulai: string | null
    spkSelesai: string | null
    persenDibayar: number
    termin: { urutan: number; persen: number; status: string; jatuhTempo: string }[] | null
  } | null
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
