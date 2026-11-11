import TerminTemplate from '@/components/organisms/TerminTemplate'

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function TerminPage() {
  return <TerminTemplate />
}
