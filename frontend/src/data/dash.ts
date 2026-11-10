import type { ContractStatus } from "@/interfaces/db";
import type { ReportFlow } from "@/interfaces/db";
import type { RoleKey } from "@/interfaces/auth";

export const iconPaths: Record<string, string> = {
  home: "M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z",
  file: "M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5M9 13h6M9 17h6",
  plus: "M12 5v14M5 12h14",
  flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z M9 12l2 2 4-4",
  clock: "M12 7v5l3 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1-4 4.5-6 8-6s7 2 8 6",
  wallet:
    "M4 7h15a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 7l12-3v3M16 13.5h1.5",
  doc: "M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 8h6M9 12h6M9 16h3",
  logout: "M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 8l-4 4 4 4M6 12h10",
  globe:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
  check: "M5 12.5l4.5 4.5L19 7.5",
  alert: "M12 4l9 16H3zM12 10v4M12 17.5v.5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  search: "M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM16 16l4 4",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  refresh:
    "M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5",
  sign: "M3 17c3-1 4-6 6-6s1 5 3 5 3-3 5-3 2 2 4 2M3 21h18",
  lock: "M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  map: "M9 4l6 2 5-2v14l-5 2-6-2-5 2V6zM9 4v14M15 6v14",
  pin: "M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  image:
    "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM21 15l-3.1-3.1a2 2 0 0 0-2.8 0L6 21",
  bell: "M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2.2 2.2 0 0 0 4 0",
  sidebar:
    "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM9 5v14",
};

export const statusTone: Record<ContractStatus, string> = {
  draf: "muted",
  diaudit: "outline",
  ditinjau: "tint",
  ditandatangani: "blue",
  dipublikasikan: "blue",
  berjalan: "ink",
  selesai: "done",
};

export const flowTone: Record<ReportFlow, string> = {
  baru: "red",
  diverifikasi: "tint",
  diteruskan: "ink",
  ditindaklanjuti: "blue",
  ditutup: "done",
};

export const placeholderFor: Partial<Record<string, string>> = {
  perangkat_desa:
    "Tulis tanggapan untuk warga. Contoh: Penyedia akan memperbaiki retakan paling lambat Jumat.",
  bpd: "Catatan untuk desa atau Inspektorat. Wajib diisi untuk klarifikasi, eskalasi, dan selesai.",
  inspektorat: "Tulis hasil pemeriksaan atau alasan penutupan.",
};

export const buatKontrakSteps = [
  "Jenis kontrak",
  "Pihak kedua",
  "Pertanyaan",
  "Draf & audit AI",
  "Pratinjau & simpan",
];

export const tabsFor: Record<RoleKey, string[] | null> = {
  perangkat_desa: null,
  pihak_kedua: [
    "ringkasan",
    "draf",
    "peninjauan",
    "tanda-tangan",
    "spk",
    "termin",
    "progres",
    "riwayat",
  ],
  bpd: null,
  inspektorat: null,
  warga: ["ringkasan", "progres", "laporan", "riwayat"],
};

export const rancanganPlans = {
  lhp: {
    role: "inspektorat",
    label: "Uji petik dan LHP",
    title: "Uji petik dan Laporan Hasil Pemeriksaan",
    desc: "Inspektorat akan bisa memilih sampel kontrak, mencatat temuan lapangan, dan menerbitkan LHP yang terhubung ke kontrak dan laporan warga.",
    items: [
      "Memilih sampel kontrak berdasarkan skor risiko",
      "Formulir temuan lapangan dengan foto",
      "Draf LHP dan rekomendasi tindak lanjut",
      "Pemantauan tindak lanjut oleh desa",
    ],
  },
  admin: {
    role: null,
    label: "Admin Daerah",
    title: "Admin Daerah",
    desc: "Admin kabupaten akan mengelola akun perangkat desa, BPD, dan Inspektorat, serta aturan ambang pengadaan per wilayah.",
    items: [
      "Undangan akun resmi untuk desa, BPD, dan Inspektorat",
      "Pengaturan ambang pengadaan langsung",
      "Pustaka pasal dan dasar hukum",
      "Rekap kabupaten",
    ],
  },
} as const;

export const whoLabel = {
  perangkat_desa: "Perangkat desa",
  pihak_kedua: "Pihak kedua",
  bpd: "BPD",
  inspektorat: "Inspektorat",
  warga: "Warga",
};
