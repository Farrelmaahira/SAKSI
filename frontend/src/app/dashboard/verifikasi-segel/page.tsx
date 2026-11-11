import VerifikasiSegelTemplate from '@/components/organisms/VerifikasiSegelTemplate'
// The file drop and photo picker are the public /lacak components, so they need its styles too.

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function VerifikasiSegelPage() {
  return <VerifikasiSegelTemplate />
}
