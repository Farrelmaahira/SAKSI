"use client";

import { useDash } from "@/hooks/use-dash";
import PageHead from "@/components/molecules/PageHead";
import { roleLabels } from "@/data/auth";
import { wilayahLabel } from "@/lib/auth/wilayah-label";
import ProfilDesa from "@/components/organisms/ProfilDesa";
import ProfilUsaha from "@/components/organisms/ProfilUsaha";
import ProfilAkun from "@/components/organisms/ProfilAkun";
import ProfilWarga from "@/components/organisms/ProfilWarga";

export default function ProfilTemplate() {
  const { session } = useDash();
  const r = session.role.role;
  const title = {
    perangkat_desa: "Profil desa",
    pihak_kedua: "Profil usaha",
    bpd: "Profil",
    inspektorat: "Profil",
    warga: "Profil",
    admin_daerah: "Profil",
  }[r];
  return (
    <>
      <PageHead
        label="Profil"
        title={title}
        desc={`${roleLabels[r]} · ${wilayahLabel(session.role)}`}
      />
      <div className="grid gap-20 [&>*]:min-w-0">
        {r === "perangkat_desa" && <ProfilDesa />}
        {r === "pihak_kedua" && <ProfilUsaha />}
        {r === "warga" && <ProfilWarga />}
        <ProfilAkun />
      </div>
    </>
  );
}
