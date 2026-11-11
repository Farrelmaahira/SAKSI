import BuatKontrakTemplate from "@/components/organisms/BuatKontrakTemplate";

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function BuatKontrakPage() {
  return <BuatKontrakTemplate />;
}
