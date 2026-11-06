import { TOKENS_KEY } from '@/data/auth'
import type { Token } from '@/interfaces/auth'
import { createStore } from '@/lib/store/create-store'

export const tokens = createStore<Token[]>(TOKENS_KEY, () => [])
