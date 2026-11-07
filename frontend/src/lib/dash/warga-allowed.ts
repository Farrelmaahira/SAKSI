/* Pages a citizen account may open; contracts are followed on the public portal instead */
const pages = ['/dashboard', '/dashboard/laporan', '/dashboard/laporan/baru', '/dashboard/notifikasi', '/dashboard/profil']

export const wargaAllowed = (path: string) => pages.includes(path.replace(/\/$/, '') || '/')
