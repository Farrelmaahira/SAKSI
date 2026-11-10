import { Suspense } from "react";
import AturUlangSandiTemplate from "@/components/organisms/AturUlangSandiTemplate";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const metadata = pageMetadata({
  title: "Atur ulang kata sandi",
  description: "Buat kata sandi baru untuk akun SAKSI Anda.",
  path: "/atur-ulang-sandi",
  noindex: true,
});

export default function AturUlangSandiPage() {
  return (
    <Suspense>
      <AturUlangSandiTemplate />
    </Suspense>
  );
}
