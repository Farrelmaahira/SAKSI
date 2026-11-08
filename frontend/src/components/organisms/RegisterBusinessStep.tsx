import PillButton from '@/components/atoms/PillButton'
import OptionCards from '@/components/molecules/OptionCards'
import TextField from '@/components/molecules/TextField'
import { typeHints } from '@/data/auth'
import { counterpartyTypes } from '@/data/master'
import type { AuthError } from '@/interfaces/auth'
import type { CounterpartyType } from '@/interfaces/master'

interface Props {
  business: string
  type: CounterpartyType | null
  npwp: string
  address: string
  error: AuthError | null
  onBusiness: (v: string) => void
  onType: (v: CounterpartyType) => void
  onNpwp: (v: string) => void
  onAddress: (v: string) => void
  onBack: () => void
}

export default function RegisterBusinessStep({ business, type, npwp, address, error, onBusiness, onType, onNpwp, onAddress, onBack }: Props) {
  const fieldError = (f: string) => (error?.field === f ? error.error : undefined)

  return (
    <div className="[animation:pop_0.35s_ease-out] grid gap-20" key="business">
      <TextField
        id="reg-business"
        label="Nama usaha atau lembaga"
        autoComplete="organization"
        placeholder="Contoh: CV Maju Bersama"
        autoFocus
        value={business}
        onChange={(e) => onBusiness(e.target.value)}
        error={fieldError('business')}
      />
      <OptionCards
        legend="Jenis"
        options={counterpartyTypes.map((t) => ({ value: t, label: t, hint: typeHints[t] }))}
        value={type}
        onChange={onType}
        error={fieldError('type')}
      />
      <TextField
        id="reg-npwp"
        label="NPWP (opsional)"
        inputMode="numeric"
        placeholder="15 atau 16 angka"
        value={npwp}
        onChange={(e) => onNpwp(e.target.value)}
        error={fieldError('npwp')}
      />
      <TextField
        id="reg-address"
        label="Alamat"
        autoComplete="street-address"
        placeholder="Nama jalan, desa, kecamatan, kota"
        value={address}
        onChange={(e) => onAddress(e.target.value)}
        error={fieldError('address')}
      />
      <div className="items-center flex gap-24 justify-between mt-8 [&.is-end]:justify-end auth-actions">
        <button type="button" className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue [&.light:hover:not(:disabled)]:[color:inherit] [&.light:hover:not(:disabled)]:opacity-[0.7] disabled:cursor-not-allowed disabled:opacity-[0.3] [.hash-actions_&:hover]:[color:inherit] [.hash-actions_&:hover]:opacity-[0.7] [.verify-samples_&]:mt-0 [.verify-samples_&]:mr-24 [.verify-samples_&]:mb-10 [.verify-samples_&]:ml-0 [.hash-status_&]:[grid-column:2] [.hash-status_&]:[justify-self:start] [.d-panel-ink_.verify-samples_&]:mt-0 [.d-panel-ink_.verify-samples_&]:mr-20 [.d-panel-ink_.verify-samples_&]:mb-10 [.d-panel-ink_.verify-samples_&]:ml-0" onClick={onBack}>
          Kembali
        </button>
        <PillButton type="submit" tone="blue">
          Lanjut
        </PillButton>
      </div>
    </div>
  )
}
