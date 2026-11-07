import type { Benefit, Feature } from "@/interfaces/content";

export const features: Feature[] = [
  {
    title: "Draf perjanjian dengan AI",
    text: "Isi kebutuhan transaksi, AI menyusun draf awal. Perangkat desa tinggal meninjau dan menyesuaikan.",
    image: "writing-online_x665",
  },
  {
    title: "Audit kelengkapan pasal",
    text: "Pasal wajib seperti para pihak, nilai, jangka waktu, dan sanksi diperiksa sebelum kontrak disahkan.",
    image: "all-checked_d3u6",
  },
  {
    title: "Tanda tangan elektronik dan e‑meterai",
    text: "Alur penandatanganan dan pembubuhan meterai elektronik, disajikan sebagai simulasi.",
    image: "digital-signature_ttti",
    tag: "Simulasi",
  },
  {
    title: "Hash dokumen",
    text: "Kontrak final mendapat sidik digital. Satu huruf berubah, hash ikut berubah, dan perubahan langsung terlihat.",
    image: "fingerprint_kdwq",
  },
  {
    title: "Publikasi dan pelacakan",
    text: "Kontrak dibuka untuk publik, progres pekerjaan dilacak, dan warga bisa mengirim laporan bila ada yang janggal.",
    image: "in-progress_2mox",
  },
];

export const benefits: Benefit[] = [
  {
    title: "Perangkat desa",
    text: "Menyusun kontrak tanpa harus menguasai seluruh aturan hukum.",
    image: "document-ready_o5d5",
  },
  {
    title: "Warga",
    text: "Ikut mengawasi penggunaan APB Desa dari kontrak yang terbuka.",
    image: "online-community_3o0l",
  },
  {
    title: "Pengawas",
    text: "Mendapat data terstruktur dan jejak audit yang rapi.",
    image: "data-reports_l2u3",
  },
  {
    title: "UMKM",
    text: "Punya kontrak tertulis tanpa harus membayar jasa hukum.",
    image: "food-truck_my6o",
  },
];
