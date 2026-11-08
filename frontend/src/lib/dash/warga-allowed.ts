/* Pages a citizen account may open */
const exactPages = [
  '/dashboard',
  '/dashboard/kontrak',
  '/dashboard/laporan',
  '/dashboard/laporan/baru',
  '/dashboard/notifikasi',
  '/dashboard/profil',
]

export const wargaAllowed = (path: string): boolean => {
  const clean = path.replace(/\/$/, '') || '/'
  if (exactPages.includes(clean)) return true
  // Izinkan halaman detail kontrak /dashboard/kontrak/[code], tetapi tolak pembuatan /dashboard/kontrak/baru
  if (clean.startsWith('/dashboard/kontrak/') && clean !== '/dashboard/kontrak/baru') {
    return true
  }
  return false
}
