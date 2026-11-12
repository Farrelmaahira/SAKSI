interface Input {
  pct: number
  last: number
  note: string
  /* links are only asked for on server contracts */
  links?: string
}

/* First problem with a progress report, or the evidence links to send. */
export function validateProgress({ pct, last, note, links }: Input): { error: string } | { buktiUrl: string[] } {
  if (pct <= last) return { error: `Progres harus lebih dari ${last}%.` }
  if (note.trim().length < 5) return { error: 'Tulis catatan singkat pekerjaan yang sudah selesai.' }
  const buktiUrl = (links ?? '').split(/\s+/).filter(Boolean)
  if (links !== undefined && buktiUrl.some((u) => !/^https:\/\/\S+$/.test(u))) return { error: 'Tautan bukti harus diawali https://.' }
  if (buktiUrl.length > 10) return { error: 'Maksimal 10 tautan bukti.' }
  return { buktiUrl }
}
