'use client'

import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { counterpartyStore } from '@/lib/master/counterparty-store'
import { villageById } from '@/lib/master/village-by-id'
import { regionRules, villageHeads } from '@/data/master'
import { usersForVillage } from '@/lib/auth/users-for-village'
import { scopeContracts } from '@/lib/db/scope-contracts'
import Panel from '@/components/molecules/Panel'
import { regionById } from '@/lib/master/region-by-id'
import { formatRp } from '@/lib/contracts/format-rp'
import Link from 'next/link'
import Badge from '@/components/atoms/Badge'

export default function ProfilDesa() {
  const { session } = useDash()
  const d = db.use()
  const parties = counterpartyStore.use()
  const v = villageById(session.role.villageId)!
  const rule = regionRules[v.regionId]
  const people = usersForVillage(v.id)
  const used = new Set(scopeContracts(d, session.role).map((c) => c.counterpartyId))
  return (
    <div className="d-grid-2">
      <Panel title={`Desa ${v.name}`}>
        <dl className="d-summary">
          <div>
            <dt>Kode desa</dt>
            <dd>{v.code}</dd>
          </div>
          <div>
            <dt>Kecamatan</dt>
            <dd>{v.district}</dd>
          </div>
          <div>
            <dt>Kabupaten</dt>
            <dd>{regionById(v.regionId)?.name}</dd>
          </div>
          <div>
            <dt>Kepala desa</dt>
            <dd>{villageHeads[v.id]}</dd>
          </div>
          <div>
            <dt>Batas pengadaan langsung</dt>
            <dd>
              {formatRp(rule.directMax)}
              <small className="d-block d-muted">{rule.basis}</small>
            </dd>
          </div>
        </dl>
        <p className="d-fine">
          Data wilayah dikelola <Link href="/dashboard/admin-daerah">Admin Daerah</Link>.
        </p>
      </Panel>
      <div className="d-stack">
        <Panel title="Akun dengan akses ke desa">
          <ul className="d-list">
            {people.map((p) => (
              <li key={`${p.email}-${p.role.id}`}>
                <div>
                  <strong>{p.name}</strong>
                  <small>
                    {p.role.title} · {p.email}
                  </small>
                </div>
                <Badge tone={p.status === 'aktif' ? 'done' : 'muted'}>{p.status === 'aktif' ? 'Aktif' : p.status === 'dikunci' ? 'Dikunci' : 'Menunggu'}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Pihak kedua yang pernah berkontrak">
          <ul className="d-list">
            {parties
              .filter((p) => used.has(p.id) || p.invited)
              .map((p) => (
                <li key={p.id}>
                  <div>
                    <strong>{p.name}</strong>
                    <small>
                      {p.type} · {p.contact} · {p.email}
                    </small>
                  </div>
                  {p.invited && !used.has(p.id) && <Badge tone="tint">Diundang</Badge>}
                </li>
              ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}
