import ProfilTemplate from '@/components/organisms/ProfilTemplate'

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function ProfilPage() {
  return <ProfilTemplate />
}
