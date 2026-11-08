'use client'

import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { notificationsFor } from '@/lib/notifications/notifications-for'
import { useReadIds } from '@/lib/notifications/use-read-ids'
import { markRead } from '@/lib/notifications/mark-read'
import NotAllowed from '@/components/molecules/NotAllowed'
import PageHead from '@/components/molecules/PageHead'
import Panel from '@/components/molecules/Panel'
import NotifList from '@/components/molecules/NotifList'
import Empty from '@/components/molecules/Empty'
import Btn from '@/components/atoms/Btn'

export default function NotifikasiTemplate() {
  const { session } = useDash()
  const d = db.use()
  const read = useReadIds(session.userId)
  if (session.role.role !== 'warga') return <NotAllowed />

  const items = notificationsFor(session, d, [])
  const unread = items.filter((n) => !read.includes(n.id))

  return (
    <>
      <PageHead
        label="Notifikasi"
        title="Notifikasi"
        desc="Kabar saat laporan Anda ditanggapi, diteruskan ke Inspektorat, atau ditutup."
        actions={
          <Btn variant="ghost" disabled={!unread.length} onClick={() => markRead(session.userId, items.map((n) => n.id))}>
            Tandai semua dibaca
          </Btn>
        }
      />
      <Panel>
        {items.length ? <NotifList items={items} read={read} userId={session.userId} /> : <Empty title="Belum ada notifikasi." text="Kabar tentang laporan Anda akan muncul di sini." />}
      </Panel>
    </>
  )
}
