"use client";

import Btn from "@/components/atoms/Btn";
import Hint from "@/components/atoms/Hint";
import Locked from "@/components/atoms/Locked";
import CitizenView from "@/components/molecules/CitizenView";
import Panel from "@/components/molecules/Panel";
import PublicationNotice from "@/components/molecules/PublicationNotice";
import RedactionReport from "@/components/molecules/RedactionReport";
import PublishEditor from "@/components/organisms/PublishEditor";
import { usePublication } from "@/hooks/use-publication";
import type { TabProps } from "@/interfaces/dash";

export default function PublikasiTab({ c, session }: TabProps) {
  const pub = usePublication(c, session);
  const isDesa = session.role.role === "perangkat_desa";
  const sealed = c.seals.length > 0;

  return (
    <div className="items-stretch grid gap-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] [&>*]:min-w-0">
      <Panel
        title="Publikasi ke portal warga"
        desc="Warga bisa mencari kontrak dengan kode atau hash, memeriksa keaslian, dan mengirim laporan."
      >
        {c.publication && (
          <PublicationNotice code={c.code} at={c.publication.at} />
        )}
        {pub.published && <RedactionReport published={pub.published} />}
        {!sealed ? (
          <Locked text="Segel dokumen terlebih dahulu. Hanya dokumen tersegel yang bisa dipublikasikan." />
        ) : !isDesa ? (
          !c.publication && <Hint>Belum dipublikasikan oleh desa.</Hint>
        ) : pub.editing ? (
          <PublishEditor c={c} pub={pub} />
        ) : (
          <Btn variant="ghost" onClick={() => pub.setEditing(true)}>
            Ubah bagian yang tampil
          </Btn>
        )}
      </Panel>
      <CitizenView shown={c.publication ? c.publication.fields : pub.fields} />
    </div>
  );
}
