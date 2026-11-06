/* Only same-site paths are accepted, so a crafted ?from= cannot send people to another site. */
export function safeRedirect(from: string | null, fallback = '/dashboard') {
  return from && from.startsWith('/') && !from.startsWith('//') ? from : fallback
}
