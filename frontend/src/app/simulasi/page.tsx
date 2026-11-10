import SimulasiTemplate from "@/components/organisms/SimulasiTemplate";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const metadata = pageMetadata({
  title: "Simulasi dan tentang SAKSI",
  description:
    "Coba membuat kontrak desa langkah demi langkah: pilih jenis, susun pasal dengan bantuan AI, tanda tangan dan e-meterai, segel dengan hash, lalu publikasikan.",
  path: "/simulasi",
});

export default function SimulasiPage() {
  return <SimulasiTemplate />;
}
