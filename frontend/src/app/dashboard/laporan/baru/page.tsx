import BuatLaporanTemplate from "@/components/organisms/BuatLaporanTemplate";

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function BuatLaporanPage() {
  return <BuatLaporanTemplate />;
}
