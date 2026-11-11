"use client";

import dynamic from "next/dynamic";

// The drag-and-drop code (@dnd-kit) loads only on this page, after the rest of it; the box keeps the page from jumping meanwhile.
const SimulatorLazy = dynamic(
  () => import("@/components/organisms/Simulator"),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[1650px] md:min-h-[1600px] lg:min-h-[960px]"
        role="status"
        aria-label="Memuat simulator"
      />
    ),
  },
);

export default SimulatorLazy;
