import { regions } from '@/data/master'

export const regionById = (id?: string) => regions.find((r) => r.id === id)
