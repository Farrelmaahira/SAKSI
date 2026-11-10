import type { ApiNotification } from '@/interfaces/api'
import { listNotifications } from '@/lib/api/list-notifications'
import { readNotification } from '@/lib/api/read-notification'
import { readAllNotifications } from '@/lib/api/read-all-notifications'

export interface NotifState {
  owner: string
  status: 'idle' | 'loading' | 'ok' | 'error'
  items: ApiNotification[]
  unread: number
  nextBefore: number | null
  error: string
  busy: boolean
}

const initial: NotifState = { owner: '', status: 'idle', items: [], unread: 0, nextBefore: null, error: '', busy: false }
let state = initial
const listeners = new Set<() => void>()
const set = (patch: Partial<NotifState>) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

/* GET /notifications shared by the topbar bell, the notification page and the citizen home, so read marks stay in sync. */
export const notifStore = {
  get: () => state,
  getServer: () => initial,
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  /* first page for this account; a different account starts over */
  async load(owner: string, force = false) {
    if (state.owner === owner && !force && state.status !== 'idle') return
    set({ ...initial, owner, status: 'loading' })
    const r = await listNotifications({ limit: 30 })
    if (state.owner !== owner) return
    if (!r.ok) return set({ status: 'error', error: r.error })
    set({ status: 'ok', items: r.data.items ?? [], unread: r.data.unreadCount, nextBefore: r.data.nextBefore })
  },
  async loadMore() {
    if (!state.nextBefore || state.busy) return
    const owner = state.owner
    set({ busy: true })
    const r = await listNotifications({ limit: 30, before: state.nextBefore })
    if (state.owner !== owner) return
    if (!r.ok) return set({ busy: false, error: r.error })
    set({ busy: false, error: '', items: [...state.items, ...(r.data.items ?? [])], unread: r.data.unreadCount, nextBefore: r.data.nextBefore })
  },
  async read(id: number) {
    const n = state.items.find((x) => x.id === id)
    if (!n || n.dibaca) return
    // optimistic: the mark comes back if the server refuses
    set({ items: state.items.map((x) => (x.id === id ? { ...x, dibaca: true } : x)), unread: Math.max(0, state.unread - 1) })
    const r = await readNotification(id)
    if (!r.ok) set({ items: state.items.map((x) => (x.id === id ? { ...x, dibaca: false } : x)), unread: state.unread + 1, error: r.error })
  },
  async readAll() {
    set({ busy: true })
    const r = await readAllNotifications()
    if (!r.ok) return set({ busy: false, error: r.error })
    set({ busy: false, error: '', unread: 0, items: state.items.map((x) => ({ ...x, dibaca: true })) })
  },
}
