import type { CounterpartyType } from '@/interfaces/master'

/* Everything typed into the "Daftar pihak kedua" form across its three steps. */
export interface RegisterForm {
  name: string
  email: string
  business: string
  type: CounterpartyType | null
  npwp: string
  address: string
  password: string
  confirm: string
  agree: boolean
}
