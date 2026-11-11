import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'
import FormField from '@/components/molecules/FormField'
import type { useAdminOversight } from '@/hooks/use-admin-oversight'
import { jenisLabel } from '@/lib/admin/jenis-label'

interface Props {
  admin: ReturnType<typeof useAdminOversight>
}

/* Pick a contract and a pengawas, then assign them */
export default function AssignPengawasForm({ admin }: Props) {
  const { form, setForm, contracts, people } = admin
  return (
    <form className="grid gap-12 md:grid-cols-2" noValidate onSubmit={(e) => { e.preventDefault(); admin.save() }}>
      <FormField label="Kontrak">
        <select value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })}>
          <option value="">{contracts.length ? 'Pilih kontrak' : 'Belum ada kontrak terbit'}</option>
          {contracts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nomor} · {c.judul}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Pengawas">
        <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
          <option value="">Pilih pengawas</option>
          {people.map((p) => (
            <option key={p.userId} value={p.userId}>
              {p.nama} ({jenisLabel(p.jenis)})
            </option>
          ))}
        </select>
      </FormField>
      {admin.error && <div className="md:col-span-2"><FormAlert>{admin.error}</FormAlert></div>}
      <div>
        <Btn type="submit" disabled={admin.busy}>{admin.busy ? 'Menyimpan…' : 'Tugaskan'}</Btn>
      </div>
    </form>
  )
}
