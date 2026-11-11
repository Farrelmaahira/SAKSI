import KontrakListTemplate from '@/components/organisms/KontrakListTemplate'

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function KontrakPage() {
  return <KontrakListTemplate />
}
