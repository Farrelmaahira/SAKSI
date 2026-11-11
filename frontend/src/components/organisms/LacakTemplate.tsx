"use client";

import ReportSection from "@/components/organisms/ReportSection";
import TrackHero from "@/components/organisms/TrackHero";
import TrackResults from "@/components/organisms/TrackResults";
import VerifySection from "@/components/organisms/VerifySection";
import { useLacak } from "@/hooks/use-lacak";
import { useReveal } from "@/hooks/use-reveal";

export default function LacakTemplate() {
  useReveal();
  const { resultRef, reportRef, q, input, setInput, registry, loading, error, found, reportCode, setReportCode, reportError, open, search, goReport } = useLacak();

  return (
    <main>
      <TrackHero registry={registry} input={input} onInput={setInput} onSearch={search} onOpen={open} />
      <TrackResults ref={resultRef} registry={registry} loading={loading} error={error} query={q} found={found} onOpen={open} onReport={goReport} />
      <VerifySection onOpen={open} />
      <ReportSection ref={reportRef} registry={registry} code={reportCode} onCode={setReportCode} error={reportError} onOpen={open} />
    </main>
  );
}
