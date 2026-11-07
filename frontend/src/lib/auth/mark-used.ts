import { tokens } from './tokens-store'

export const markUsed = (token: string) => tokens.set((list) => list.map((t) => (t.token === token ? { ...t, usedAt: Date.now() } : t)))
