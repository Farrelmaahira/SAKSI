import type { TokenKind } from '@/interfaces/auth'
import { tokens } from './tokens-store'

export function issueToken(userId: string, kind: TokenKind, minutes: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  const token = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  tokens.set((list) => [...list.filter((t) => !(t.userId === userId && t.kind === kind)), { token, userId, kind, expiresAt: Date.now() + minutes * 60000 }])
  return token
}
