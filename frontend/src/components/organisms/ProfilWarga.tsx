'use client'

import { useDash } from '@/hooks/use-dash'
import { users } from '@/lib/auth/users-store'
import { villageById } from '@/lib/master/village-by-id'
import { regionById } from '@/lib/master/region-by-id'
import Panel from '@/components/molecules/Panel'
import Badge from '@/components/atoms/Badge'
import Icon from '@/components/atoms/Icon'

export default function ProfilWarga() {
  const { session } = useDash()
  const u = users.use().find((x) => x.id === session.userId)
  const v = villageById(session.role.villageId)

  return (
    <div className="d-grid-2">
      <Panel title="Data diri">
        <dl className="d-summary">
          <div>
            <dt>Nama</dt>
            <dd>{session.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{session.email}</dd>
          </div>
          <div>
            <dt>Nomor HP</dt>
            <dd>{u?.phone ?? '-'}</dd>
          </div>
          <div>
            <dt>Desa domisili</dt>
            <dd>{v ? `${v.name}, ${v.district}, ${regionById(v.regionId)?.name}` : '-'}</dd>
          </div>
          <div>
            <dt>Status akun</dt>
            <dd>
              <Badge tone="done">Email terverifikasi</Badge>
            </dd>
          </div>
        </dl>
      </Panel>
      <Panel title="Keamanan pelapor">
        <p className="d-ok">
          <Icon name="shield" />
          Nama, email, dan nomor HP Anda tidak ditampilkan ke pemerintah desa. Hanya BPD dan Inspektorat yang dapat melihat identitas pelapor.
        </p>
      </Panel>
    </div>
  )
}
