import type { ScopeFolderItem } from "@/interfaces/content";

export const scopeFolders: ScopeFolderItem[] = [
  {
    title: "Pengadaan",
    note: "Barang dan jasa untuk kebutuhan desa",
    doc: "Perjanjian Pengadaan Barang",
    clause: "Pasal 5. Serah Terima",
    suggestion:
      "Pasal serah terima belum ada. Tambahkan batas waktu dan berita acara.",
    text: "Penyedia menyerahkan barang paling lambat 30 hari kalender, dibuktikan dengan berita acara serah terima.",
  },
  {
    title: "Hibah",
    note: "Bantuan yang diterima maupun disalurkan",
    doc: "Naskah Perjanjian Hibah",
    clause: "Pasal 6. Pelaporan",
    suggestion: "Kewajiban laporan penggunaan dana belum diatur.",
    text: "Penerima wajib melaporkan penggunaan dana hibah paling lambat 3 bulan setelah kegiatan selesai.",
  },
  {
    title: "Kerja sama BUMDes",
    note: "Usaha bersama dengan mitra",
    doc: "Perjanjian Kerja Sama BUMDes",
    clause: "Pasal 7. Bagi Hasil",
    suggestion: "Pembagian hasil usaha belum disebut dalam angka.",
    text: "Keuntungan bersih dibagi 60 persen untuk BUMDes dan 40 persen untuk mitra setiap akhir semester.",
  },
  {
    title: "Sewa aset desa",
    note: "Tanah, bangunan, dan peralatan milik desa",
    doc: "Perjanjian Sewa Aset Desa",
    clause: "Pasal 3. Nilai dan Jangka Waktu",
    suggestion: "Nilai sewa dan syarat perpanjangan belum lengkap.",
    text: "Nilai sewa Rp12.000.000 per tahun selama 2 tahun dan dapat diperpanjang atas persetujuan kedua pihak.",
  },
];
