import { useEffect, useState } from "react";
import type { ApiResult } from "@/interfaces/api";
import type { DReport } from "@/interfaces/db";
import { listReports } from "@/lib/api/list-reports";
import type { CreatedReportResponse } from "@/lib/api/reports";
import { toDReport } from "@/lib/api/to-dreport";
import { isClosed } from "@/lib/db/is-closed";

export type MyReportFilter = "semua" | "proses" | "selesai";

/* The citizen's own reports from the server, filtered by status and counted. */
export function useMyReports(userId: string) {
  const [filter, setFilter] = useState<MyReportFilter>("semua");
  const [res, setRes] = useState<ApiResult<CreatedReportResponse[]> | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    listReports().then((r) => active && setRes(r));
    return () => {
      active = false;
    };
  }, [userId]);

  // contractCode = server id: /lacak resolves it to the published contract
  const rows = res?.ok
    ? res.data.map((x) => ({ r: toDReport(x), title: x.contractTitle }))
    : [];
  const all: DReport[] = rows.map((x) => x.r);

  return {
    res,
    filter,
    setFilter,
    total: all.length,
    counts: {
      semua: all.length,
      proses: all.filter((r) => !isClosed(r)).length,
      selesai: all.filter(isClosed).length,
    },
    list: rows.filter(
      ({ r }) =>
        filter === "semua" ||
        (filter === "selesai" ? isClosed(r) : !isClosed(r)),
    ),
  };
}
