import type { Metadata } from 'next'
import { Suspense } from "react";
import KontrakDetailTemplate from "@/components/organisms/KontrakDetailTemplate";

export const metadata: Metadata = { title: 'Detail kontrak' }

// The dashboard renders after a browser-side session check, so there is no static shell to validate.
export const instant = false

export default function KontrakDetailPage() {
  return (
    <Suspense>
      <KontrakDetailTemplate />
    </Suspense>
  );
}
