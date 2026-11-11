import LaporanTemplate from '@/components/organisms/LaporanTemplate'

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function LaporanPage() {
  return <LaporanTemplate />
}
