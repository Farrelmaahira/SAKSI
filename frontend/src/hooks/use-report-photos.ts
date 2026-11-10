import { useState } from 'react'

const MAX = 4

/* Evidence photos: preview urls for the screen and the raw files for the upload, kept in step. */
export function useReportPhotos() {
  const [urls, setUrls] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])

  const add = (list: FileList | null) => {
    if (!list) return
    const valid = [...list].filter((f) => f.type.startsWith('image/'))
    setUrls((p) => [...p, ...valid.map((f) => URL.createObjectURL(f))].slice(0, MAX))
    setFiles((f) => [...f, ...valid].slice(0, MAX))
  }

  const remove = (i: number) => {
    URL.revokeObjectURL(urls[i])
    setUrls((p) => p.filter((_, j) => j !== i))
    setFiles((f) => f.filter((_, j) => j !== i))
  }

  const clear = () => {
    setUrls([])
    setFiles([])
  }

  return { urls, files, add, remove, clear }
}
