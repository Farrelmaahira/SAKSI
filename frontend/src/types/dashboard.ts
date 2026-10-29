export type UserRole = 'kades' | 'bpd' | 'inspektorat'

export interface UserProfile {
  name: string
  role: UserRole
  roleLabel: string
  avatar: string
  nip: string
  desa: string
}

export interface KpiMetric {
  id: string
  label: string
  value: number
  prefix?: string
  suffix?: string
  formatAsCurrency?: boolean
  changePercent: number
  isPositive: boolean
  comparisonText: string
  iconType: 'document' | 'wallet' | 'shield' | 'alert'
}

export interface ContractRow {
  id: string
  name: string
  vendor: string
  amount: number
  status: 'tersegel' | 'audit_lengkap' | 'dalam_tinjauan' | 'perlu_revisi'
  rating: number
  soldQty?: number
}

export interface WidgetOption {
  id: string
  title: string
  description: string
  category: string
  tag: string
}

