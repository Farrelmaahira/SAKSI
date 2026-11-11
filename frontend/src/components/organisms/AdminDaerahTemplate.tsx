"use client";

import { useDash } from "@/hooks/use-dash";
import NotAllowed from "@/components/molecules/NotAllowed";
import PageHead from "@/components/molecules/PageHead";
import Panel from "@/components/molecules/Panel";
import RowList from "@/components/molecules/RowList";
import Badge from "@/components/atoms/Badge";
import AdminRegionRules from "@/components/organisms/AdminRegionRules";
import AdminOversight from "@/components/organisms/AdminOversight";

const soon = [
  "Undangan akun resmi untuk desa, BPD, dan Inspektorat",
  "Pustaka pasal dan dasar hukum",
  "Rekap kabupaten",
  "Mencabut penugasan pengawas",
];

export default function AdminDaerahTemplate() {
  const { session } = useDash();
  if (session.role.role !== "admin_daerah") return <NotAllowed />;
  return (
    <>
      <PageHead
        label="Admin daerah"
        title="Admin Daerah"
        desc="Atur ambang pengadaan dan tugaskan pengawas untuk kontrak desa di wilayah Anda."
      />
      <div className="items-start grid gap-20 lg:grid-cols-[repeat(2,minmax(0,1fr))] [&>*]:min-w-0">
        <AdminRegionRules />
        <div className="grid gap-20 [&>*]:min-w-0">
          <AdminOversight />
        </div>
      </div>
      <Panel title="Segera hadir" desc="Fitur ini belum tersedia di server.">
        <RowList>
          {soon.map((x) => (
            <li key={x} className="opacity-[0.6]">
              <div>
                <strong>{x}</strong>
              </div>
              <Badge tone="tint">Segera hadir</Badge>
            </li>
          ))}
        </RowList>
      </Panel>
    </>
  );
}
