import type { ReactNode } from "react";
import type { TabProps } from "@/interfaces/dash";
import RingkasanTab from "@/components/organisms/RingkasanTab";
import DrafVersiTab from "@/components/organisms/DrafVersiTab";
import AuditAiTab from "@/components/organisms/AuditAiTab";
import PeninjauanTab from "@/components/organisms/PeninjauanTab";
import TandaTanganTab from "@/components/organisms/TandaTanganTab";
import SegelTab from "@/components/organisms/SegelTab";
import PublikasiTab from "@/components/organisms/PublikasiTab";
import SpkTab from "@/components/organisms/SpkTab";
import TerminTab from "@/components/organisms/TerminTab";
import ProgresTab from "@/components/organisms/ProgresTab";
import LaporanTab from "@/components/organisms/LaporanTab";
import RiwayatTab from "@/components/organisms/RiwayatTab";

export const allTabs: {
  key: string;
  label: string;
  C: (p: TabProps) => ReactNode;
}[] = [
  { key: "ringkasan", label: "Ringkasan", C: RingkasanTab },
  { key: "draf", label: "Draf & Versi", C: DrafVersiTab },
  { key: "audit", label: "Audit AI", C: AuditAiTab },
  { key: "peninjauan", label: "Peninjauan", C: PeninjauanTab },
  { key: "tanda-tangan", label: "Tanda Tangan", C: TandaTanganTab },
  { key: "segel", label: "Segel", C: SegelTab },
  { key: "publikasi", label: "Publikasi", C: PublikasiTab },
  { key: "spk", label: "SPK", C: SpkTab },
  { key: "termin", label: "Termin", C: TerminTab },
  { key: "progres", label: "Progres", C: ProgresTab },
  { key: "laporan", label: "Laporan Warga", C: LaporanTab },
  { key: "riwayat", label: "Riwayat", C: RiwayatTab },
];
