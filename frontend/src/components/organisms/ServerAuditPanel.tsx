import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'
import Hint from '@/components/atoms/Hint'
import AuditResult from '@/components/molecules/AuditResult'
import Panel from '@/components/molecules/Panel'
import type { useServerAudit } from '@/hooks/use-server-audit'
import type { Clause } from '@/interfaces/drafting'

interface Props {
  linked: boolean
  clauses: Clause[]
  server: ReturnType<typeof useServerAudit>
}

/* Runs and shows the server's audit of the latest version */
export default function ServerAuditPanel({ linked, clauses, server }: Props) {
  const { audit, auditing, run } = server
  return (
    <Panel
      title="Audit ulang"
      desc={linked ? 'Periksa versi terbaru di server, baik hasil AI maupun suntingan manual.' : 'Kontrak ini hanya tersimpan di perangkat ini, jadi belum bisa diaudit oleh server.'}
      action={<Btn small icon="refresh" onClick={run} disabled={!linked || auditing}>{auditing ? 'Mengaudit...' : 'Audit ulang'}</Btn>}
    >
      {auditing && <p role="status" className="text-[1.4rem] text-dim">Server sedang memeriksa pasal…</p>}
      {!auditing && audit && !audit.ok && (
        <div className="grid gap-12 justify-items-start">
          <FormAlert>{audit.code === 'AI_UNAVAILABLE' ? audit.error : `Audit gagal. ${audit.error}`}</FormAlert>
          <Btn small icon="refresh" onClick={server.retry}>Coba lagi</Btn>
        </div>
      )}
      {!auditing && linked && !audit && <p role="status" className="text-[1.4rem] text-dim">Memuat audit terakhir…</p>}
      {!auditing && audit?.ok && !audit.data && <Hint>Belum ada audit untuk versi terbaru. Tekan Audit ulang untuk memeriksanya.</Hint>}
      {!auditing && audit?.ok && audit.data && <AuditResult audit={audit.data} clauses={clauses} />}
    </Panel>
  )
}
