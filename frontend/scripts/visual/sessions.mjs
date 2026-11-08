/* Signed-in users from data/auth.ts (seed accounts), written to localStorage before the app starts. */
const village = { villageId: 'sukamaju' }
const role = (id, key, title, extra) => ({ id, role: key, title, ...extra })
const kades = role('r-kades', 'perangkat_desa', 'Kepala Desa', village)
const penyedia = role('r-penyedia', 'pihak_kedua', 'Penyedia', { counterpartyId: 'cp-maju' })
const bpd = role('r-bpd', 'bpd', 'Ketua BPD', village)
const inspCjr = role('r-insp-cjr', 'inspektorat', 'Auditor Inspektorat', { regionId: 'kab-cianjur' })
const inspSbg = role('r-insp-sbg', 'inspektorat', 'Auditor Inspektorat', { regionId: 'kab-subang' })
const make = (userId, name, email, active, roles = [active]) => ({ userId, name, email, role: active, roles })

export const SESSIONS = {
  kades: make('u-kades', 'Hendra Wijaya', 'kades@saksi.id', kades),
  penyedia: make('u-penyedia', 'Rina Kartika', 'penyedia@saksi.id', penyedia),
  bpd: make('u-bpd', 'Asep Saepudin', 'bpd@saksi.id', bpd),
  'insp-cianjur': make('u-insp', 'Dewi Lestari', 'inspektorat@saksi.id', inspCjr, [inspCjr, inspSbg]),
  'insp-subang': make('u-insp', 'Dewi Lestari', 'inspektorat@saksi.id', inspSbg, [inspCjr, inspSbg]),
}
