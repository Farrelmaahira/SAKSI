"use client";

import dynamic from "next/dynamic";

// The letter preview is only needed on the review and signing steps.
const LetterPreviewLazy = dynamic(
  () => import("@/components/organisms/LetterPreview"),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[300px]"
        role="status"
        aria-label="Memuat pratinjau surat"
      />
    ),
  },
);

export default LetterPreviewLazy;
