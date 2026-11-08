import type { Session } from "@/interfaces/auth";
import { update } from "@/lib/db/update";
import { completeSigning } from "@/lib/db/complete-signing";
import { nowIso } from "@/lib/dates/now-iso";
import { log } from "@/lib/db/log";
import { find } from "@/lib/db/find";
import { newMeteraiSerial } from "@/lib/db/new-meterai-serial";

export function applyMeterai(code: string, s: Session) {
  const serial = newMeteraiSerial();
  update(code, (c) =>
    completeSigning(
      {
        ...c,
        signatures: { ...c.signatures, meterai: { serial, at: nowIso() } },
      },
      s.name,
    ),
  );
  log(s, "Membubuhkan e-meterai simulasi", find(code), serial);
}
