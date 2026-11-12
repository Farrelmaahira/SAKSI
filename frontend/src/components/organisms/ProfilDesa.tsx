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
    <div className="items-stretch grid gap-20 lg:grid-cols-[repeat(2,minmax(0,1fr))] [&>*]:min-w-0">
      <Panel title={`Desa ${v.name}`}>
        <dl className="grid [&>div]:border-t-[0.1rem] [&>div]:border-t-[#ececea] [&>div]:[border-top-style:solid] [&>div]:grid [&>div]:gap-3 [&>div]:py-10 [&>div]:px-0 [&>div:first-child]:border-t-0 [&>div:first-child]:[border-top-style:none] [&>div:first-child]:pt-0 [&_dt]:text-[1.25rem] [&_dt]:text-dim [&_dd]:text-[1.5rem]! [&_dd]:leading-[1.45] md:[&>div]:gap-20 md:[&>div]:grid-cols-[16rem_minmax(0,1fr)]">
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
              <small className="block text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">{rule.basis}</small>
            </dd>
          </div>
        </dl>
        <p className="text-[1.25rem] leading-[1.5] text-dim [&_a]:border-b-[0.1rem] [&_a]:border-b-current [&_a]:[border-bottom-style:solid]">
          Data wilayah dikelola <Link href="/dashboard/admin-daerah">Admin Daerah</Link>.
        </p>
      </Panel>
      <div className="grid gap-20 [&>*]:min-w-0">
        <Panel title="Akun dengan akses ke desa">
          <ul className="grid list-none list-outside [&_li]:items-center [&_li]:border-t-[0.1rem] [&_li]:border-t-[#ececea] [&_li]:[border-top-style:solid] [&_li]:flex [&_li]:gap-14 [&_li]:justify-between [&_li]:py-12 [&_li]:px-0 [&_li:first-child]:border-t-0 [&_li:first-child]:[border-top-style:none] [&_li:first-child]:pt-0 [&_li>div]:grid [&_li>div]:gap-2 [&_li>div]:min-w-0 [&_strong]:font-[420] [&_small]:text-[1.3rem] [&_small]:text-dim [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap">
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
          <ul className="grid list-none list-outside [&_li]:items-center [&_li]:border-t-[0.1rem] [&_li]:border-t-[#ececea] [&_li]:[border-top-style:solid] [&_li]:flex [&_li]:gap-14 [&_li]:justify-between [&_li]:py-12 [&_li]:px-0 [&_li:first-child]:border-t-0 [&_li:first-child]:[border-top-style:none] [&_li:first-child]:pt-0 [&_li>div]:grid [&_li>div]:gap-2 [&_li>div]:min-w-0 [&_strong]:font-[420] [&_small]:text-[1.3rem] [&_small]:text-dim [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap">
            {parties
              .filter((p) => used.has(p.id) || p.invited)
              .map((p) => (
                <li key={p.id}>
                  <div>
                    <strong>{p.name}</strong>
                    <small>
                      {[p.type, p.contact, p.email].filter(Boolean).join(' · ')}
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
