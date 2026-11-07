import type {
  Counterparty,
  CounterpartyType,
  Region,
  RegionRule,
  Village,
} from "@/interfaces/master";

export const regions: Region[] = [
  { id: "kab-cianjur", name: "Kabupaten Cianjur" },
  { id: "kab-subang", name: "Kabupaten Subang" },
];

export const villages: Village[] = [
  {
    id: "sukamaju",
    name: "Desa Sukamaju",
    code: "3203152005",
    district: "Kec. Cibeber",
    regionId: "kab-cianjur",
  },
  {
    id: "cibodas",
    name: "Desa Cibodas",
    code: "3203152011",
    district: "Kec. Cibeber",
    regionId: "kab-cianjur",
  },
  {
    id: "mekarsari",
    name: "Desa Mekarsari",
    code: "3213082004",
    district: "Kec. Pagaden",
    regionId: "kab-subang",
  },
];

export const villageHeads: Record<string, string> = {
  sukamaju: "Hendra Wijaya",
  cibodas: "Ujang Suryana",
  mekarsari: "Siti Aminah",
};

export const regionRules: Record<string, RegionRule> = {
  "kab-cianjur": {
    directMax: 200_000_000,
    basis: "Perbup Cianjur tentang Pengadaan di Desa (contoh)",
  },
  "kab-subang": {
    directMax: 150_000_000,
    basis: "Perbup Subang tentang Pengadaan di Desa (contoh)",
  },
};

export const counterpartyTypes: CounterpartyType[] = [
  "Penyedia",
  "UMKM",
  "BUMDes",
  "Penerima hibah",
  "Penyewa",
];

export const seedCounterparties: Counterparty[] = [
  {
    id: "cp-maju",
    name: "CV Maju Bersama",
    type: "Penyedia",
    npwp: "01.234.567.8-405.000",
    address: "Jl. Raya Cibeber No. 12, Cianjur",
    email: "penyedia@saksi.id",
    contact: "Rina Kartika",
  },
  {
    id: "cp-karya",
    name: "CV Karya Mandiri",
    type: "Penyedia",
    npwp: "02.345.678.9-405.000",
    address: "Jl. Siliwangi No. 4, Cianjur",
    email: "karya@contoh.id",
    contact: "Dadang Hermawan",
  },
  {
    id: "cp-subur",
    name: "CV Subur Jaya",
    type: "Penyedia",
    address: "Jl. Otista No. 21, Subang",
    email: "subur@contoh.id",
    contact: "Yayan Sopyan",
  },
  {
    id: "cp-sri",
    name: "Kelompok Tani Sri Rejeki",
    type: "Penerima hibah",
    address: "Dusun Kaler, Desa Mekarsari",
    email: "srirejeki@contoh.id",
    contact: "Darto",
  },
  {
    id: "cp-sari",
    name: "Warung Bu Sari",
    type: "Penyewa",
    address: "Pasar Desa Sukamaju, Kios 4",
    email: "busari@contoh.id",
    contact: "Sari Lestari",
  },
  {
    id: "cp-bumdes",
    name: "BUMDes Sukamaju Sejahtera",
    type: "BUMDes",
    address: "Balai Desa Sukamaju",
    email: "bumdes@contoh.id",
    contact: "Iwan Setiawan",
  },
  {
    id: "cp-tani",
    name: "UD Tani Makmur",
    type: "UMKM",
    address: "Jl. Pasar Cibeber No. 8",
    email: "tanimakmur@contoh.id",
    contact: "Euis Rohmah",
  },
];
