/* What gets recorded. Steps use accessible names and visible text only (never CSS classes), because classes change during the refactor.
   Add `only: [375]` to run a step on some viewports only.
   A step is one of: { click|hover|check: loc }, { fill: loc, value }, { select: loc, value }, { wait: ms }, { snap: 'name' }.
   A loc is { role, name } | { text } | { label } | { placeholder }, plus optional exact / nth / in (another loc to search inside). */
export const ALL = [375, 768, 1440]
export const HEIGHT = { 375: 812, 768: 1024, 1440: 900 }

const list = []
// Pages with a GSAP pin (the home page) change height when the viewport is resized, so they are shot as viewport-sized tiles while scrolling.
const add = (s) => list.push({ viewports: ALL, steps: [], tiles: s.id.startsWith('home'), ...s })
const btn = (name, extra) => ({ role: 'button', name, ...extra })
const link = (name, extra) => ({ role: 'link', name, ...extra })

// ---------- public site
add({ id: 'home', path: '/' })
add({ id: 'home-menu', path: '/', steps: [{ click: btn('Buka menu') }, { wait: 800 }] })
add({ id: 'home-hover-hero-cta', path: '/', viewports: [1440], steps: [{ hover: link('Kenapa penting') }] })
add({ id: 'home-hover-nav-cta', path: '/', viewports: [1440], steps: [{ hover: link('Coba simulasi') }] })
add({ id: 'home-hover-feature', path: '/', viewports: [1440], steps: [{ hover: { text: 'Draf perjanjian dengan AI' } }] })

add({ id: 'simulasi', path: '/simulasi' })
add({ id: 'simulasi-faq-open', path: '/simulasi', viewports: [375, 1440], steps: [{ click: btn(/Apakah saya harus paham hukum/) }, { wait: 600 }] })
add({
  id: 'simulasi-flow', path: '/simulasi', viewports: [375, 1440],
  steps: [
    { click: btn(/^Hibah/) }, { snap: 'wrong-type' },
    { click: btn(/^Pengadaan/) }, { snap: 'type-chosen' }, { click: btn('Langkah berikutnya') },
    { click: btn(/^Promosi Usaha/) }, { snap: 'wrong-clause' },
    { click: btn(/^Nilai Kontrak/) }, { click: btn(/^Para Pihak/) }, { snap: 'ai-suggestion' },
    { click: btn('Terapkan') }, { wait: 3500 }, { snap: 'ai-written' },
    { click: btn(/^Serah Terima/) }, { click: btn(/^Jangka Waktu/) }, { snap: 'five-clauses' }, { click: btn(/^Sanksi Keterlambatan/) }, { snap: 'clauses-done' },
    { click: btn('Langkah berikutnya') },
    { click: btn(/Tanda tangan Kepala Desa/) }, { snap: 'one-signed' }, { click: btn(/E.meterai 10\.000/) }, { click: btn(/Tanda tangan penyedia/) }, { snap: 'all-signed' },
    { click: btn('Langkah berikutnya') }, { snap: 'hash-before' },
    { click: btn('Segel dokumen') }, { wait: 1500 }, { snap: 'hash-sealed' },
    { fill: { label: 'Nilai kontrak' }, value: '25000000' }, { snap: 'hash-changed' }, { click: btn('Kembalikan') },
    { click: btn('Langkah berikutnya') }, { snap: 'publish-ready' },
    { click: btn('Publikasikan kontrak') }, { snap: 'published' },
  ],
})

add({ id: 'lacak', path: '/lacak' })
add({ id: 'lacak-q-014', path: '/lacak?q=SKS-2026-014' })
add({ id: 'lacak-q-031', path: '/lacak?q=SKS-2026-031', steps: [{ snap: 'closed' }, { click: { text: /Isi kontrak/ } }, { snap: 'clauses-open' }] })
add({ id: 'lacak-q-none', path: '/lacak?q=tidak-ada', viewports: [375, 1440] })
add({
  id: 'lacak-report-flow', path: '/lacak?q=SKS-2026-014', viewports: [375, 1440],
  steps: [
    { click: { in: { role: 'group', name: /Apa yang janggal/ }, text: 'Pekerjaan tidak sesuai kontrak', exact: true } }, { snap: 'category' }, { click: btn('Lanjut') },
    { select: { label: 'Pasal yang tidak sesuai' }, value: 'Objek Pekerjaan' },
    { fill: { label: 'Ceritakan yang Anda lihat' }, value: 'Pasir yang datang hanya setengah truk, padahal di kontrak tertulis 6 m3.' },
    { fill: { label: /Lokasi/ }, value: 'Balai Desa Sukamaju' }, { snap: 'story' },
    { check: { label: 'Sembunyikan identitas saya' } }, { snap: 'identity-shown' },
    { click: btn('Lanjut') }, { snap: 'review' }, { click: btn('Kirim laporan') }, { snap: 'ticket' },
  ],
})

add({ id: 'masuk', path: '/masuk' })
add({ id: 'masuk-wrong-password', path: '/masuk', viewports: [375, 1440], steps: [{ fill: { label: 'Email' }, value: 'kades@saksi.id' }, { fill: { label: 'Kata sandi' }, value: 'salah' }, { click: btn('Masuk') }, { wait: 600 }, { snap: 'error' }] })
add({ id: 'masuk-role-step', path: '/masuk', viewports: [375, 1440], steps: [{ fill: { label: 'Email' }, value: 'inspektorat@saksi.id' }, { fill: { label: 'Kata sandi' }, value: 'saksi123' }, { click: btn('Masuk') }, { wait: 800 }] })
add({ id: 'masuk-demo-open', path: '/masuk', viewports: [375, 1440], steps: [{ click: { text: /Akun demo/ } }] })
add({
  id: 'daftar-flow', path: '/daftar', viewports: [375, 1440],
  steps: [
    { snap: 'step0' }, { click: btn('Lanjut') }, { snap: 'step0-errors' },
    { fill: { label: 'Nama lengkap' }, value: 'Budi Santoso' }, { fill: { label: 'Email' }, value: 'budi@usaha.id' }, { click: btn('Lanjut') },
    { fill: { label: 'Nama usaha atau lembaga' }, value: 'CV Baru Jaya' }, { click: { text: 'UMKM', exact: true } }, { fill: { label: 'Alamat' }, value: 'Jl. Merdeka 10, Bandung' }, { snap: 'step1' },
    { click: btn('Lanjut') }, { fill: { label: 'Kata sandi', exact: true }, value: 'rahasia123' }, { fill: { label: 'Konfirmasi kata sandi' }, value: 'rahasia123' }, { snap: 'step2' },
    { click: { text: /Saya paham ini prototipe/ } }, { click: btn('Daftar') }, { wait: 800 }, { snap: 'done' },
  ],
})
add({ id: 'lupa-sandi', path: '/lupa-sandi', viewports: [375, 1440], steps: [{ snap: 'form' }, { fill: { label: 'Email' }, value: 'kades@saksi.id' }, { click: btn('Kirim link atur ulang') }, { snap: 'sent' }] })
add({ id: 'verifikasi', path: '/verifikasi', viewports: [375, 1440] })
add({ id: 'atur-ulang-sandi', path: '/atur-ulang-sandi', viewports: [375, 1440] })
add({ id: 'not-found', path: '/tidak-ada', viewports: [375, 1440] })

// ---------- dashboard
const roles = ['kades', 'penyedia', 'bpd', 'insp-cianjur', 'insp-subang']
const pages = ['', '/kontrak', '/kontrak/baru', '/laporan', '/laporan/baru', '/termin', '/jejak-audit', '/verifikasi-segel', '/profil', '/lhp', '/admin-daerah', '/notifikasi', '/halaman-hilang']
for (const session of roles)
  for (const p of pages) add({ id: `dash-${session}${p.replaceAll('/', '-') || '-home'}`, path: `/dashboard${p}`, session, viewports: [375, 1440] })

for (const session of roles) {
  add({ id: `dash-${session}-notif`, path: '/dashboard', session, viewports: [1440], steps: [{ click: btn(/Notifikasi/) }, { wait: 300 }] })
  add({ id: `dash-${session}-usermenu`, path: '/dashboard', session, viewports: [1440], steps: [{ click: { role: 'button', name: /Wijaya|Kartika|Saepudin|Lestari/, nth: 0 } }, { wait: 300 }] })
  add({ id: `dash-${session}-sidebar-collapsed`, path: '/dashboard', session, viewports: [1440], steps: [{ click: btn('Sembunyikan navigasi') }, { wait: 300 }] })
  add({ id: `dash-${session}-drawer`, path: '/dashboard', session, viewports: [375], steps: [{ click: btn(/navigasi/) }, { wait: 300 }] })
  add({ id: `dash-${session}-confirm`, path: '/dashboard', session, viewports: [375, 1440], steps: [{ click: btn(/navigasi/), only: [375] }, { wait: 300, only: [375] }, { click: { text: 'Reset data demo' } }, { wait: 300 }] })
}

const tabs = ['', 'draf', 'audit', 'peninjauan', 'tanda-tangan', 'segel', 'publikasi', 'spk', 'termin', 'progres', 'laporan', 'riwayat']
for (const session of roles)
  for (const code of ['SKS-2026-014', 'SKS-2026-045'])
    for (const tab of tabs) add({ id: `dash-${session}-detail-${code}-${tab || 'ringkasan'}`, path: `/dashboard/kontrak/${code}${tab ? `?tab=${tab}` : ''}`, session, viewports: [1440] })
for (const tab of ['', 'termin', 'progres', 'riwayat']) add({ id: `dash-kades-detail-SKS-2026-014-${tab || 'ringkasan'}-mobile`, path: `/dashboard/kontrak/SKS-2026-014${tab ? `?tab=${tab}` : ''}`, session: 'kades', viewports: [375, 768] })

export const SCENARIOS = list
