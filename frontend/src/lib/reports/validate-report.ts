interface Fields {
  category: string
  clause: string
  text: string
}

/* Error message per field of the report form; '' means the field is fine. */
export const validateReport = ({ category, clause, text }: Fields) => ({
  category: category ? '' : 'Pilih jenis kejanggalan.',
  clause: clause ? '' : 'Pilih pasal yang tidak sesuai.',
  text: text.trim().length >= 15 ? '' : 'Ceritakan minimal 15 karakter.',
})
