import JejakAuditTemplate from "@/components/organisms/JejakAuditTemplate";

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function JejakAuditPage() {
  return <JejakAuditTemplate />;
}
