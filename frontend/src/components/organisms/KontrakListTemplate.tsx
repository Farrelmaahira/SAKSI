'use client'

import Btn from '@/components/atoms/Btn'
import Chips from '@/components/molecules/Chips'
import DataTable from '@/components/molecules/DataTable'
import Empty from '@/components/molecules/Empty'
import PageHead from '@/components/molecules/PageHead'
import Panel from '@/components/molecules/Panel'
import SearchBox from '@/components/molecules/SearchBox'
import ContractRow from '@/components/organisms/ContractRow'
import { kontrakHead } from '@/data/kontrak-head'
import { useContractList } from '@/hooks/use-contract-list'

export default function KontrakListTemplate() {
  const { role, isDesa, all, list, chips, filter, setFilter, query, setQuery, needsMe } = useContractList()
  const head = kontrakHead[role]
  const columns = ['Kontrak', ...(role === 'inspektorat' ? ['Desa'] : []), role === 'pihak_kedua' ? 'Desa' : 'Pihak kedua', { label: 'Nilai', numeric: true as const }, 'Status', 'Progres', 'Langkah berikutnya']

  return (
    <>
      <PageHead label="Kontrak" title={head.title} desc={head.desc} actions={isDesa && <Btn to="/dashboard/kontrak/baru" icon="plus">Buat kontrak</Btn>} />
      <Panel>
        <div className="items-center flex flex-wrap gap-12 justify-between">
          <Chips items={chips} value={filter} onChange={setFilter} />
          <SearchBox label="Cari kontrak" placeholder="Cari kode, judul, atau pihak" value={query} onChange={setQuery} />
        </div>
        {list.length ? (
          <DataTable columns={columns}>
            {list.map((c) => (
              <ContractRow key={c.apiId ?? c.code} c={c} role={role} mine={needsMe(c)} />
            ))}
          </DataTable>
        ) : (
          <Empty
            art="data-reports_l2u3"
            title={all.length ? 'Tidak ada kontrak yang cocok.' : 'Belum ada kontrak.'}
            text={all.length ? 'Coba ubah filter atau kata pencarian.' : isDesa ? 'Mulai dengan membuat kontrak pertama desa.' : 'Kontrak akan tampil di sini setelah dikirim desa.'}
            action={isDesa && !all.length ? <Btn to="/dashboard/kontrak/baru">Buat kontrak</Btn> : undefined}
          />
        )}
      </Panel>
    </>
  )
}
