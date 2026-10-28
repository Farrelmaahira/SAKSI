export const shortHash = (h: string) => (h ? `${h.slice(0, 10)}…${h.slice(-6)}` : '')
