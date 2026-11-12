import Btn from "@/components/atoms/Btn";
import SourceBadge from "@/components/atoms/SourceBadge";
import VersionSelect from "@/components/molecules/VersionSelect";
import DraftEditBody from "@/components/organisms/DraftEditBody";
import ClauseVersionList from "@/components/molecules/ClauseVersionList";
import Panel from "@/components/molecules/Panel";
import type { useDraftEditor } from "@/hooks/use-draft-editor";
import type { DContract } from "@/interfaces/db";
import { downloadVersion } from "@/lib/dash/download-version";
import { fmtDateTime } from "@/lib/dates/fmt-date-time";

interface DraftVersionPanelProps {
  c: DContract;
  editor: ReturnType<typeof useDraftEditor>;
  canEdit: boolean;
  revising: boolean;
}

/* One version of the contract: read it, pick another version, or edit its clauses */
export default function DraftVersionPanel({
  c,
  editor: e,
  canEdit,
  revising,
}: DraftVersionPanelProps) {
  const { ver, latest, editing } = e;
  const desc = editing
    ? revising
      ? "Simpan akan membuat versi baru dan mengirimkannya untuk ditinjau ulang."
      : "Perubahan langsung diaudit ulang oleh AI."
    : `Dibuat ${fmtDateTime(ver.at)}${ver.note ? ` · ${ver.note}` : ""}`;

  return (
    <Panel
      title={editing ? `Mengubah versi ${latest.no}` : `Versi ${ver.no}`}
      desc={desc}
      action={
        !editing && (
          <div className="items-center flex flex-wrap gap-10">
            <SourceBadge source={ver.source} />
            {c.versions.length > 1 && (
              <VersionSelect
                versions={c.versions}
                value={ver.no}
                latestNo={latest.no}
                onChange={e.setVerNo}
              />
            )}
            <Btn
              small
              variant="ghost"
              icon="doc"
              onClick={() => downloadVersion(c, ver)}
            >
              Unduh (simulasi PDF)
            </Btn>
            {canEdit && (
              <Btn small icon="sign" onClick={e.start}>
                Ubah pasal
              </Btn>
            )}
          </div>
        )
      }
    >
      {editing ? (
        <DraftEditBody c={c} editor={e} revising={revising} />
      ) : (
        <ClauseVersionList version={ver} previous={e.prev} />
      )}
    </Panel>
  );
}
