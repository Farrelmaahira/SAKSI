import { normalizeEmail } from './normalize-email'
import { users } from './users-store'

export const findUser = (email: string) => users.get().find((u) => u.email === normalizeEmail(email))
