import type { Clause } from "@/interfaces/drafting";

const TITLE: Record<string, RegExp> = {
  sanksi: /sanksi|denda/i,
  kahar: /kahar|force majeure/i,
  retensi: /retensi/i,
  sengketa: /perselisihan|sengketa/i,
  objek: /lingkup|objek/i,
  pembayaran: /pembayaran/i,
  jangka_waktu: /jangka waktu/i,
};

/* Server drafts carry codes like "P-07" instead of the local keys, so a clause is found by its key or by its title. */
export const findClause = (clauses: Clause[], key: string) =>
  clauses.find((c) => c.key === key || TITLE[key]?.test(c.title));
