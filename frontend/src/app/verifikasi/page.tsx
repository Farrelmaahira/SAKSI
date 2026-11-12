import VerifikasiTemplate from "@/components/organisms/VerifikasiTemplate";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const metadata = pageMetadata({
  title: "Verifikasi email",
  description: "Aktifkan akun pihak kedua SAKSI Anda lewat link verifikasi yang kami kirim ke email, lalu masuk untuk menandatangani kontrak desa.",
  path: "/verifikasi",
  noindex: true,
});

export default function VerifikasiPage() {
  return (
    <VerifikasiTemplate />
  );
}
