import { sha256 } from '@/lib/contracts/sha256'
import { normalizeEmail } from './normalize-email'

export const hashPassword = (email: string, password: string) => sha256(`${normalizeEmail(email)}:${password}`)
