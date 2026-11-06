import { villages } from '@/data/master'

export const villageById = (id?: string) => villages.find((v) => v.id === id)
