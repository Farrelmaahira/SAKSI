"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReportSection from "@/components/organisms/ReportSection";
import TrackHero from "@/components/organisms/TrackHero";
import TrackResults from "@/components/organisms/TrackResults";
import VerifySection from "@/components/organisms/VerifySection";
import { useReveal } from "@/hooks/use-reveal";
import type { SealedContract } from "@/interfaces/contract";
import { findContract } from "@/lib/contracts/find-contract";
import { listPublicContracts } from "@/lib/api/list-public-contracts";
import { usePublicContract } from "@/hooks/use-public-contract";
import { toSealedContract } from "@/lib/api/to-sealed-contract";

export default function LacakTemplate() {
  useReveal();
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const [input, setInput] = useState(q);
  const [list, setList] = useState<SealedContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportCode, setReportCode] = useState("");
  const resultRef = useRef<HTMLElement>(null);
  const reportRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;
    listPublicContracts().then((r) => {
      if (!active) return;
      setLoading(false);
      if (r.ok) setList(r.data.map(toSealedContract));
      // the API needs a signed-in account, even for the public registry
      else setError(r.status === 401 ? "Masuk dengan akun SAKSI untuk melihat kontrak desa." : r.error);
    });
    return () => {
      active = false;
    };
  }, []);

  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) {
    setLastQ(q);
    setInput(q);
  }
  const found = list.find((c) => String(c.apiId) === q) ?? findContract(list, q);
  // the opened contract and the one picked for a report get their full published text (clauses, hash)
  const foundDetail = usePublicContract(found?.apiId);
  const reportDetail = usePublicContract(list.find((c) => c.code === reportCode)?.apiId);
  const registry = list.map((c) => (reportDetail?.ok && reportDetail.data.code === c.code ? reportDetail.data : c));

  const syncKey = `${found?.code ?? ""}|${registry.length}`;
  const [lastSync, setLastSync] = useState("");
  if (syncKey !== lastSync) {
    setLastSync(syncKey);
    if (found) setReportCode(found.code);
    else if (!reportCode && registry[0]) setReportCode(registry[0].code);
  }

  const setQuery = (value: string) =>
    router.push(value ? `/lacak?q=${encodeURIComponent(value)}` : "/lacak", {
      scroll: false,
    });

  const open = (code: string) => {
    setQuery(code);
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    setQuery(value);
    if (value)
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      );
  };

  const goReport = () => {
    if (found) setReportCode(found.code);
    reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main>
      <TrackHero
        registry={registry}
        input={input}
        onInput={setInput}
        onSearch={onSearch}
        onOpen={open}
      />
      <TrackResults
        ref={resultRef}
        registry={registry}
        loading={loading || (Boolean(found) && !foundDetail)}
        error={error || (foundDetail?.ok === false ? foundDetail.error : "")}
        query={q}
        found={foundDetail?.ok ? foundDetail.data : undefined}
        onOpen={open}
        onReport={goReport}
      />
      <VerifySection registry={registry} onOpen={open} />
      <ReportSection
        ref={reportRef}
        registry={registry}
        code={reportCode}
        onCode={setReportCode}
        error={reportDetail?.ok === false ? reportDetail.error : ""}
        onOpen={open}
      />
    </main>
  );
}
