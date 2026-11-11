"use client";

import Chips from "@/components/molecules/Chips";
import NotAllowed from "@/components/molecules/NotAllowed";
import PageHead from "@/components/molecules/PageHead";
import SearchBox from "@/components/molecules/SearchBox";
import LaporanList from "@/components/organisms/LaporanList";
import LaporanSayaTemplate from "@/components/organisms/LaporanSayaTemplate";
import { laporanHead } from "@/data/laporan-head";
import { useLaporan } from "@/hooks/use-laporan";

export default function LaporanTemplate() {
  const laporan = useLaporan();
  const { role, counts } = laporan;
  if (role === "warga") return <LaporanSayaTemplate />;
  if (role === "pihak_kedua" || role === "admin_daerah") return <NotAllowed />;
  const head = laporanHead[role];

  return (
    <>
      <PageHead label="Laporan warga" title={head.title} desc={head.desc} />
      <div className="items-center flex flex-wrap gap-12 justify-between">
        <Chips
          items={[
            { key: "perlu", label: "Perlu tindakan", count: counts.perlu },
            { key: "semua", label: "Semua", count: counts.semua },
            { key: "proses", label: "Diproses", count: counts.proses },
            { key: "selesai", label: "Selesai", count: counts.selesai },
          ]}
          value={laporan.filter}
          onChange={laporan.setFilter}
        />
        <SearchBox label="Cari laporan" placeholder="Cari kode laporan, kontrak, atau isi" value={laporan.query} onChange={laporan.setQuery} />
      </div>
      <LaporanList laporan={laporan} />
    </>
  );
}
