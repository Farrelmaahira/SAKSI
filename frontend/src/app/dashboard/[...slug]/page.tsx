import PageMissing from "@/components/molecules/PageMissing";

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function DashboardMissingPage() {
  return <PageMissing />;
}
