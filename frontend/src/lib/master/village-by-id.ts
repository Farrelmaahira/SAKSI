import { villages } from '@/data/master'
import type { Village } from '@/interfaces/master'

const numericVillageMap: Record<string, string> = {
  '1': 'sukamaju',
  '2': 'cibodas',
  '3': 'mekarsari',
}

export const villageById = (id?: string | number): Village | undefined => {
  if (id === undefined || id === null || id === '') return villages[0]
  const key = String(id).toLowerCase().trim()
  const mappedKey = numericVillageMap[key] ?? key
  return (
    villages.find((v) => v.id.toLowerCase() === mappedKey || v.id.toLowerCase() === key || v.code === key) ??
    villages[0]
  )
}
