import { Suspense } from "react";
import TrackShell from "@/components/organisms/TrackShell";
import LacakTemplate from "@/components/organisms/LacakTemplate";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const metadata = pageMetadata({
  title: "Lacak dan lapor kontrak desa",
  description:
    "Cari kontrak desa dengan kode atau hash, lihat isi dan progres pekerjaannya, cek keaslian dokumen, dan laporkan kejanggalan.",
  path: "/lacak",
});

export default function LacakPage() {
  return (
    <Suspense fallback={<TrackShell />}>
      <LacakTemplate />
    </Suspense>
  );
}
