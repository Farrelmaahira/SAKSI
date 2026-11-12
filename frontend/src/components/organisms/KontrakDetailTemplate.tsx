'use client'

import Btn from '@/components/atoms/Btn'
import Empty from '@/components/molecules/Empty'
import ContractView from '@/components/organisms/ContractView'
import { useContractLookup } from '@/hooks/use-contract-lookup'

export default function KontrakDetailTemplate() {
  const { code, c, loading, session } = useContractLookup()

  if (c) return <ContractView c={c} session={session} />
  if (loading) return <Empty art="document-ready_o5d5" title="Memuat kontrak…" text="Mengambil kontrak dari server." />
  return (
    <Empty
      art="document-warning_2es6"
      title={`Kontrak ${code} tidak ditemukan.`}
      text="Kontrak mungkin bukan bagian dari wilayah atau usaha Anda, atau belum dikirim desa."
      action={<Btn to="/dashboard/kontrak">Ke daftar kontrak</Btn>}
    />
  )
}
