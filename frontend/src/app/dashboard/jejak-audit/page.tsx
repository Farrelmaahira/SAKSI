import type { Metadata } from 'next'
import JejakAuditTemplate from "@/components/organisms/JejakAuditTemplate";

export const metadata: Metadata = { title: 'Jejak audit' }

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function JejakAuditPage() {
  return <JejakAuditTemplate />;
}
