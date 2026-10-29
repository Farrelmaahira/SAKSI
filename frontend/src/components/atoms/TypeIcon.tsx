interface Props {
  kind: string
}

const paths: Record<string, string[]> = {
  Pengadaan: ['M3 5h3l2.5 10h10L21 8H7.5', 'M10 19.5a1 1 0 100 .1M17 19.5a1 1 0 100 .1'],
  Hibah: ['M4 10h16v10H4z', 'M3 7h18v3H3z', 'M12 7v13', 'M12 7c-2-4-6-4-6-1s4 1 6 1c2 0 6 2 6-1s-4-3-6 1'],
  'Kerja sama BUMDes': ['M3 12l4-4 4 3 3-2 7 5', 'M7 15l3 3M10 13l4 4M13 12l3 3', 'M3 12v4M21 14v4'],
  'Sewa aset desa': ['M8 14a4 4 0 110-8 4 4 0 010 8z', 'M11 11l9 9M16 16l2-2M18 18l2-2'],
}

/* Contract type icons, drawn as simple line marks. */
export default function TypeIcon({ kind }: Props) {
  return (
    <svg className="type-icon" viewBox="0 0 24 24" aria-hidden="true">
      {(paths[kind] ?? []).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
