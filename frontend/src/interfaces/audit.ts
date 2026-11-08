export interface AuditLog {
  id: string
  at: string
  actor: string
  role: string
  action: string
  detail?: string
  contractCode?: string
  villageId?: string
  regionId?: string
}
