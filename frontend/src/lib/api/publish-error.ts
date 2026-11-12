/* Message for a failed publication and whether trying again can help (server busy or unreachable). */
export function publishError(r: { code?: string; status: number; error: string }): { text: string; retry: boolean } {
  const text =
    r.code === 'AI_UNAVAILABLE' || r.code === 'AI_ERROR'
      ? `${r.error} Publikasi dibatalkan supaya data pribadi tidak ikut tampil.`
      : r.status === 409
        ? 'Hanya kontrak berstatus ditandatangani yang bisa dipublikasikan, atau statusnya baru berubah. Muat ulang halaman lalu coba lagi.'
        : r.error
  return { text, retry: r.status === 0 || r.status === 503 || r.status === 502 }
}
