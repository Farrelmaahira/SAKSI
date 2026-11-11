'use client'

import Callout from '@/components/atoms/Callout'
import Locked from '@/components/atoms/Locked'
import DraftVersionPanel from '@/components/organisms/DraftVersionPanel'
import SendReviewPanel from '@/components/organisms/SendReviewPanel'
import ServerAuditPanel from '@/components/organisms/ServerAuditPanel'
import { useDraftEditor } from '@/hooks/use-draft-editor'
import { useServerAudit } from '@/hooks/use-server-audit'
import type { TabProps } from '@/interfaces/dash'
import { isEditable } from '@/lib/db/is-editable'
import { openCritical } from '@/lib/db/open-critical'

export default function DrafVersiTab({ c, session, go }: TabProps) {
  const server = useServerAudit(c.apiId)
  // the previous audit belongs to the old text, so a saved edit clears it
  const editor = useDraftEditor(c, session, () => c.apiId && server.clear())
  const isDesa = session.role.role === 'perangkat_desa'
  const canEdit = isDesa && isEditable(c)
  const revising = c.status === 'ditinjau' && c.reviewDecision === 'revisi'
  const idle = isDesa && !editor.editing

  return (
    <div className="grid gap-20 [&>*]:min-w-0">
      {revising && isDesa && (
        <Callout tone="red" icon="alert">
          Pihak kedua meminta revisi{c.reviewNote ? `: “${c.reviewNote}”` : ''}. Ubah pasal lalu kirim versi baru.
        </Callout>
      )}
      <DraftVersionPanel c={c} editor={editor} canEdit={canEdit} revising={revising} />
      {idle && <ServerAuditPanel linked={Boolean(c.apiId)} clauses={editor.latest.clauses} server={server} />}
      {idle && (c.status === 'draf' || c.status === 'diaudit') && <SendReviewPanel c={c} session={session} critical={openCritical(c)} onFix={() => go('audit')} />}
      {!canEdit && idle && c.status !== 'draf' && <Locked text="Isi kontrak dikunci karena sudah dikirim. Perubahan hanya bisa dilakukan bila pihak kedua meminta revisi." />}
    </div>
  )
}
