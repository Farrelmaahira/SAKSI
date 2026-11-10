import type { CounterpartyType } from '@/interfaces/master'

export interface InviteForm {
  open: boolean
  name: string
  type: CounterpartyType
  email: string
  contact: string
  error: string
}
