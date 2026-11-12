'use client'

import Btn from '@/components/atoms/Btn'
import TextLink from '@/components/atoms/TextLink'
import ActivityFeed from '@/components/molecules/ActivityFeed'
import PageHead from '@/components/molecules/PageHead'
import Panel from '@/components/molecules/Panel'
import TodoList from '@/components/molecules/TodoList'
import DesaStats from '@/components/organisms/DesaStats'
import { useDesaHome } from '@/hooks/use-desa-home'
import { wilayahLabel } from '@/lib/auth/wilayah-label'
import { greeting } from '@/lib/dash/greeting'

export default function DesaHome() {
  const home = useDesaHome()
  const { session, role, todos } = home

  return (
    <>
      <PageHead
        label={`Beranda · ${wilayahLabel(role)}`}
        title={`${greeting()}, ${session.name.split(' ')[0]}.`}
        desc="Ringkasan kontrak desa hari ini. Mulai dari daftar “Perlu tindakan”."
        actions={<Btn to="/dashboard/kontrak/baru" icon="plus">Buat kontrak</Btn>}
      />
      <DesaStats home={home} />
      <div className="items-stretch grid gap-20 lg:grid-cols-[repeat(2,minmax(0,1fr))] [&>*]:min-w-0">
        <Panel title="Perlu tindakan" desc={todos.length ? `${todos.length} hal menunggu Anda` : undefined}>
          <TodoList items={todos} empty="Semua beres. Tidak ada yang menunggu Anda." />
        </Panel>
        <Panel title="Aktivitas terakhir" action={<TextLink href="/dashboard/jejak-audit">Lihat semua</TextLink>}>
          <ActivityFeed limit={7} />
        </Panel>
      </div>
    </>
  )
}
