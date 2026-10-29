import { REPORT_KEY } from '@/data/storage-keys'
import type { Report } from '@/interfaces/contract'
import { readStorage } from './read-storage'

export function loadReports(): Record<string, Report[]> {
  return readStorage<Record<string, Report[]>>(REPORT_KEY, {})
}
