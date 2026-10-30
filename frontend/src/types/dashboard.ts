export interface UserProfile {
  name: string
  role: 'kades' | 'bpd' | 'inspektorat'
  roleLabel: string
  roleSubtitle: string
  avatarInitial: string
  nip: string
  villageName: string
  email: string
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

export interface ContractItem {
  contractId: string
  title: string
  vendorName: string
  amount: number
  status: 'sealed' | 'audit_complete' | 'under_review' | 'draft'
  rating: number
  volume: string
  fiscalYear: number
  integrityScore: number
}

export interface WidgetOption {
  id: string
  title: string
  description: string
  category: string
  tag: string
}

export interface SpkItem {
  spkNumber: string
  contractId: string
  title: string
  vendorName: string
  amount: number
  issuedDate: string
  dueDate: string
  status: 'issued' | 'in_progress' | 'completed' | 'draft'
}

export interface TerminItem {
  terminNumber: number
  label: string
  percentage: number
  amount: number
  status: 'disbursed' | 'verified' | 'pending'
  sp2dNumber?: string
  disbursementDate?: string
  physicalProgress: number
  notes: string
}

export interface AuditFinding {
  id: string
  findingNumber: string
  contractNumber: string
  issue: string
  riskLevel: 'high' | 'medium' | 'low'
  recommendation: string
  status: 'resolved' | 'action_required' | 'under_investigation'
}

export interface CitizenReportItem {
  reportId: string
  projectTitle: string
  reporterCategory: string
  issueText: string
  submittedDate: string
  status: 'reviewed' | 'investigating' | 'resolved'
  location: string
}

export interface DashboardOverview {
  metrics: KpiMetric[]
  contracts: ContractItem[]
  integrityIndex: number
  realizationBudget: number
}
