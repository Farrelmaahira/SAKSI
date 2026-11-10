import { Suspense } from "react";
import KontrakDetailTemplate from "@/components/organisms/KontrakDetailTemplate";

export default function KontrakDetailPage() {
  return (
    <Suspense>
      <KontrakDetailTemplate />
    </Suspense>
  );
}
