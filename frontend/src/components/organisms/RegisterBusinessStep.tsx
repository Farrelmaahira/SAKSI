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
    <div className="auth-step" key="business">
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
      <div className="auth-actions">
        <button type="button" className="text-btn" onClick={onBack}>
          Kembali
        </button>
        <PillButton type="submit" tone="blue">
          Lanjut
        </PillButton>
      </div>
    </div>
  )
}
