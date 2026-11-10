import Btn from '@/components/atoms/Btn'
import ErrorText from '@/components/atoms/ErrorText'
import Hint from '@/components/atoms/Hint'
import FormField from '@/components/molecules/FormField'
import type { InviteForm } from '@/interfaces/invite'
import type { CounterpartyType } from '@/interfaces/master'

interface Props {
  form: InviteForm
  types: CounterpartyType[]
  onEdit: (patch: Partial<Pick<InviteForm, 'name' | 'email' | 'contact'>>) => void
  onType: (t: CounterpartyType) => void
  onSend: () => void
  onCancel: () => void
}

/* Form to invite a second party that is not in the list yet */
export default function InvitePartyForm({ form, types, onEdit, onType, onSend, onCancel }: Props) {
  return (
    <div className="bg-soft rounded-[1.6rem] grid gap-14 p-20 [&_h3]:text-[1.9rem] [&_h3]:font-[400]">
      <h3>Undang pihak kedua baru</h3>
      <Hint>Undangan dikirim lewat email. Mereka membuat sandi sendiri dan langsung melihat kontrak ini.</Hint>
      <div className="grid gap-16 md:grid-cols-[repeat(2,minmax(0,1fr))]">
        <FormField label="Nama usaha atau kelompok">
          <input value={form.name} onChange={(e) => onEdit({ name: e.target.value })} placeholder="Contoh: CV Sumber Rejeki" />
        </FormField>
        <FormField label="Tipe">
          <select value={form.type} onChange={(e) => onType(e.target.value as CounterpartyType)}>
            {types.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Email">
          <input type="email" value={form.email} onChange={(e) => onEdit({ email: e.target.value })} placeholder="nama@usaha.id" />
        </FormField>
        <FormField label="Penanggung jawab">
          <input value={form.contact} onChange={(e) => onEdit({ contact: e.target.value })} placeholder="Nama lengkap" />
        </FormField>
      </div>
      {form.error && <ErrorText as="p">{form.error}</ErrorText>}
      <div className="items-center flex flex-wrap gap-10">
        <Btn onClick={onSend} icon="check">
          Kirim undangan
        </Btn>
        <Btn variant="ghost" onClick={onCancel}>
          Batal
        </Btn>
      </div>
    </div>
  )
}
