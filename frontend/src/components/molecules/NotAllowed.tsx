import Empty from '@/components/molecules/Empty'
import Btn from '@/components/atoms/Btn'

export default function NotAllowed() {
  return <Empty art="document-warning_2es6" title="Halaman ini tidak tersedia untuk peran Anda." text="Gunakan menu di samping untuk membuka halaman yang sesuai." action={<Btn to="/dashboard">Ke beranda</Btn>} />
}
