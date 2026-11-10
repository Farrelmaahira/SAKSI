import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "SAKSI - Sistem Audit Kontrak Segel Integritas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const svg = await readFile(
    join(process.cwd(), "public", "saksi_logo_klasik.svg"),
  );
  const logo = `data:image/svg+xml;base64,${svg.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#0a3cce",
        color: "#ffffff",
        padding: "72px 80px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
        <div style={{ fontSize: 34, letterSpacing: 8, opacity: 0.85 }}>
          SAKSI
        </div>
        <div style={{ fontSize: 78, lineHeight: 1.05, marginTop: 28 }}>
          Setiap rupiah dana desa punya saksi.
        </div>
        <div style={{ fontSize: 30, marginTop: 36, opacity: 0.85 }}>
          Sistem Audit Kontrak Segel Integritas
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 300,
          height: 300,
          background: "#ffffff",
          borderRadius: 48,
        }}
      >
        <img src={logo} width={230} height={230} alt="" />
      </div>
    </div>,
    { ...size },
  );
}
