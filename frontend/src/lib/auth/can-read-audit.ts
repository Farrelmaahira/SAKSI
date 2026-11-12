import type { RoleKey } from "@/interfaces/auth";

/* The AI audit of a contract is an internal tool of the village and its overseers: the server refuses it (403) to the second party, so it is not even asked for. */
export const canReadAudit = (role: RoleKey) =>
  role !== "pihak_kedua" && role !== "warga";
