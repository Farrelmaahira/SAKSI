import LupaSandiTemplate from "@/components/organisms/LupaSandiTemplate";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const metadata = pageMetadata({
  title: "Lupa kata sandi",
  description: "Atur ulang kata sandi akun SAKSI Anda.",
  path: "/lupa-sandi",
  noindex: true,
});

export default function LupaSandiPage() {
  return <LupaSandiTemplate />;
}
