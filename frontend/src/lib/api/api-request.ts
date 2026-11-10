import type { ApiResult } from "@/interfaces/api";
import { getAuthToken } from "@/lib/api/reports";

import { AI_BUSY } from "@/data/drafting";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const STATUS_ERRORS: Record<number, string> = {
  401: "Sesi Anda berakhir. Masuk lagi lalu ulangi.",
  403: "Akun Anda tidak berhak melakukan ini.",
  404: "Fitur atau kontrak ini belum tersedia di server.",
  405: "Fitur ini belum tersedia di server.",
  409: "Kontrak sudah ditandatangani, jadi isinya terkunci dan tidak bisa diubah.",
  429: "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.",
};

/* JSON (or multipart, when body is FormData) request to the Go API with the bearer token. Never invents data: every failure comes back as an error message. */
export async function apiRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<ApiResult<T>> {
  const token = getAuthToken();
  const form = init.body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: init.method ?? "GET",
      headers: {
        ...(init.body !== undefined &&
          !form && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body:
        init.body === undefined
          ? undefined
          : form
            ? (init.body as FormData)
            : JSON.stringify(init.body),
    });
  } catch {
    return {
      ok: false,
      status: 0,
      error:
        "Server SAKSI tidak bisa dihubungi. Periksa koneksi lalu coba lagi.",
    };
  }
  const json = await res.json().catch(() => null);
  if (res.ok) return { ok: true, data: json as T };
  // contract: {"error":"<pesan>","code":"<KODE>"}; {"error":{"code","message"}} is still read for compatibility
  const err = json?.error;
  const code =
    typeof json?.code === "string"
      ? json.code
      : typeof err?.code === "string"
        ? err.code
        : undefined;
  const msg =
    typeof err === "string"
      ? err
      : typeof err?.message === "string"
        ? err.message
        : json?.message;
  const text = typeof msg === "string" ? msg.trim() : "";
  // every AI model is rate limited: show the backend's own message, never a substitute result
  if (code === "AI_UNAVAILABLE")
    return { ok: false, status: res.status, code, error: text || AI_BUSY };
  if (code === "RATE_LIMITED")
    return {
      ok: false,
      status: res.status,
      code,
      error: text || STATUS_ERRORS[429],
    };
  // section-7 endpoints send a displayable Indonesian message with a code (INVALID_STATE, ALREADY_PAID, WRONG_PASSWORD, ...)
  if (code && text && res.status !== 401 && code !== "CONTRACT_LOCKED")
    return { ok: false, status: res.status, code, error: text };
  return {
    ok: false,
    status: res.status,
    code,
    error:
      STATUS_ERRORS[res.status] ??
      (text || `Server menolak permintaan (kode ${res.status}).`),
  };
}
