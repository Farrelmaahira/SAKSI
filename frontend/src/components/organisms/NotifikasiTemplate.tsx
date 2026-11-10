'use client'

import { useDash } from '@/hooks/use-dash'
import { useNotifications } from '@/hooks/use-notifications'
import { notifStore } from '@/lib/notifications/notif-store'
import { toNotif } from '@/lib/notifications/to-notif'
import NotAllowed from '@/components/molecules/NotAllowed'
import PageHead from '@/components/molecules/PageHead'
import Panel from '@/components/molecules/Panel'
import NotifList from '@/components/molecules/NotifList'
import Empty from '@/components/molecules/Empty'
import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'

export default function NotifikasiTemplate() {
  const { session } = useDash()
  const n = useNotifications(session.userId)
  if (session.role.role !== 'warga') return <NotAllowed />

  const items = n.items.map(toNotif)
  const read = n.items.filter((x) => x.dibaca).map((x) => `n:${x.id}`)

  return (
    <>
      <PageHead
        label="Notifikasi"
        title="Notifikasi"
        desc="Kabar saat laporan Anda ditanggapi, diteruskan ke Inspektorat, atau ditutup."
        actions={
          <Btn variant="ghost" disabled={!n.unread || n.busy} onClick={() => notifStore.readAll()}>
            Tandai semua dibaca
          </Btn>
        }
      />
      <Panel>
        {n.status === 'loading' || n.status === 'idle' ? (
          <p className="text-[1.4rem] text-dim" role="status">Memuat notifikasi…</p>
        ) : n.status === 'error' ? (
          <FormAlert>{n.error}</FormAlert>
        ) : items.length ? (
          <>
            <NotifList items={items} read={read} userId={session.userId} />
            {n.error && <FormAlert>{n.error}</FormAlert>}
            {n.nextBefore && (
              <Btn variant="ghost" small onClick={() => notifStore.loadMore()} disabled={n.busy}>
                {n.busy ? 'Memuat…' : 'Muat notifikasi lebih lama'}
              </Btn>
            )}
          </>
        ) : (
          <Empty title="Belum ada notifikasi." text="Kabar tentang laporan Anda akan muncul di sini." />
        )}
      </Panel>
    </>
  )
}
