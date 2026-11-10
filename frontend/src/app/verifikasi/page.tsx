import { Suspense } from "react";
import VerifikasiTemplate from "@/components/organisms/VerifikasiTemplate";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const metadata = pageMetadata({
  title: "Verifikasi email",
  description: "Aktifkan akun SAKSI Anda lewat link verifikasi email.",
  path: "/verifikasi",
  noindex: true,
});

export default function VerifikasiPage() {
  return (
    <Suspense>
      <VerifikasiTemplate />
    </Suspense>
  );
}
