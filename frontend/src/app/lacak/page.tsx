import { Suspense } from "react";
import LacakTemplate from "@/components/organisms/LacakTemplate";
import "@/styles/pages.css";
import "@/styles/lacak.css";

export default function LacakPage() {
  return (
    <Suspense>
      <LacakTemplate />
    </Suspense>
  );
}
