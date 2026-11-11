/* One line of an activity feed ("Hendra Wijaya menandatangani kontrak ..."). */
export interface ActivityItem {
  id: string
  at: string
  actor: string
  role: string
  action: string
  detail?: string
  contractLabel?: string
  contractHref?: string
}
