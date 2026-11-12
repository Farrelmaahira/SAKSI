import LupaSandiTemplate from "@/components/organisms/LupaSandiTemplate";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const metadata = pageMetadata({
  title: "Lupa kata sandi",
  description: "Lupa kata sandi akun SAKSI? Masukkan email Anda dan kami kirim link untuk membuat kata sandi baru dengan aman.",
  path: "/lupa-sandi",
  noindex: true,
});

export default function LupaSandiPage() {
  return <LupaSandiTemplate />;
}
