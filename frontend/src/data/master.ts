import type {
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

