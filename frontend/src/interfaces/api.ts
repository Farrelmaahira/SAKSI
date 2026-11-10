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

/* ---- Section 7 (termin, segel, notifikasi, jejak audit, LHP, admin daerah, profil) ---- */

export type TermStatus = 'rencana' | 'jatuh_tempo' | 'dibayar' | 'terlambat'

export interface PaymentTerm {
  id: number;
  contractId: number;
  urutan: number;
  persen: number;
  nominal: number;
  jatuhTempo: string;
  status: TermStatus;
  realisasiNominal?: number | null;
  tanggalRealisasi?: string | null;
}

export interface ProgressEvidence { fileId: number; kunciPenyimpanan: string; mime: string; ukuran: number }

export interface WorkProgress {
  id: number;
  contractId: number;
  termId?: number | null;
  persenSelesai: number;
  catatan: string;
  dilaporkanOleh: number;
  pelaporNama?: string;
  waktu: string;
  bukti?: ProgressEvidence[] | null;
}

export interface Spk { id: number; contractId: number; nomor: string; tanggal: string; mulai?: string | null; selesai?: string | null }

export interface ContractTermin {
  contractId: number;
  villageId: number;
  status: string;
  nilai: number;
  totalDibayar: number;
  progresTerakhir: number;
  spk: Spk | null;
  terms: PaymentTerm[] | null;
  progress: WorkProgress[] | null;
}

export interface TerminListItem {
  contractId: number;
  nomor: string;
  judul: string;
  villageId: number;
  villageName: string;
  nilai: number;
  status: string;
  totalDibayar: number;
  progresTerakhir: number;
  terms: PaymentTerm[] | null;
}

export interface SealVerifyResult {
  cocok: boolean;
  segel?: { id: number; versionId: number; nomorVersi: number; sha256: string; waktuSegel: string; segelSebelumnyaId?: number | null; chain?: string; txHash?: string };
  kontrak?: { id: number; nomor: string; judul: string; villageName: string };
}

export interface SealItem {
  sealId: number;
  contractId: number;
  nomor: string;
  judul: string;
  villageId: number;
  villageName: string;
  versionId: number;
  nomorVersi: number;
  sha256: string;
  waktuSegel: string;
  segelSebelumnyaId?: number | null;
  chain?: string;
  txHash?: string;
  jumlahVerifikasi: number;
}

export interface ApiNotification { id: number; jenis: string; pesan: string; tautan: string; dibaca: boolean; dibacaPada: string | null; dibuatPada: string }

export interface NotificationPage { items: ApiNotification[] | null; unreadCount: number; nextBefore: number | null }

export interface AuditLogItem {
  id: number;
  aktorUserId: number;
  aktorNama: string;
  aktorRole: string;
  aksi: string;
  jenisObjek: string;
  idObjek: number;
  contractId?: number | null;
  contractJudul?: string;
  villageId?: number | null;
  villageName?: string;
  sebelum?: unknown;
  sesudah?: unknown;
  waktu: string;
}

export interface AuditLogPage { items: AuditLogItem[] | null; nextBefore: number | null }

export interface LhpFinding { id?: number; objek: 'spk' | 'termin' | 'pasal'; temuan: string; tingkat: 'kritis' | 'saran'; rekomendasi: string }

export interface AuditReport {
  id: number;
  contractId: number;
  contractJudul: string;
  villageId: number;
  villageName: string;
  jenis: 'lhp' | 'uji_petik';
  penyusunUserId: number;
  penyusunNama: string;
  ringkasan: string;
  status: 'draf' | 'terbit';
  terbitPada?: string | null;
  jumlahTemuan: number;
  findings?: LhpFinding[] | null;
}

export interface RegionRule { id: number; regionId: number; regionNama: string; ambangPembelianLangsung: number; ambangPenawaran: number; dasarHukum: string; berlakuSejak: string }

export interface Pengawas { userId: number; nama: string; email: string; jenis: 'bpd' | 'inspektorat'; villageId?: number | null; villageName?: string; regionId?: number | null }

export interface OversightAssignment { id: number; contractId: number; contractJudul: string; villageName: string; pengawasUserId: number; pengawasNama: string; jenis: string; ditetapkanPada: string }

export interface Me {
  userId: number;
  nama: string;
  email: string;
  role: string;
  villageId?: number | null;
  noHp?: string;
  usaha?: { id: number; nama: string; jenis: string; npwp?: string; alamat?: string } | null;
}

export interface ReportActionResult { action: { id: number; reportId: number; aktorUserId: number; aktorNama?: string; tindakan: string; catatan?: string; diteruskanKeRole?: string; waktu: string }; status: string }
