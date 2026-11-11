/* The backend id of a counterparty ("5"), or null for a local-only one ("cp-maju", an invited party) that the server does not know. */
export const partyApiId = (id: string): number | null => (/^\d+$/.test(id) ? Number(id) : null)

export const PARTY_NOT_ON_SERVER = 'Pihak kedua ini baru ada di perangkat ini dan belum terdaftar di server. Pilih rekanan lain dari daftar.'
