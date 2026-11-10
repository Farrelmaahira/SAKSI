import type { Finding } from "@/interfaces/drafting";

export const scoreOf = (findings: Finding[]) =>
  Math.max(
    0,
    100 -
      findings
        .filter((f) => !f.applied)
        .reduce((s, f) => s + (f.severity === "kritis" ? 18 : 6), 0),
  );
