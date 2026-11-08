/* Keeps the "after login go to" path when moving between login and register. */
export const withFrom = (path: string, from: string | null) => (from ? `${path}?from=${encodeURIComponent(from)}` : path)
