import ErrorText from "@/components/atoms/ErrorText";
import FormField from "@/components/molecules/FormField";
import { reportCategories } from "@/data/report-form";
import type { useBuatLaporan } from "@/hooks/use-buat-laporan";

interface Props {
  report: ReturnType<typeof useBuatLaporan>;
}

/* Which published contract, what kind of irregularity and which clause the citizen reports */
export default function ReportTargetFields({ report: r }: Props) {
  const { contract, contracts, detail, fields, errors, tried } = r;
  const shown = (field: keyof typeof errors) => (tried ? errors[field] : "");
  return (
    <>
      <FormField label="Kontrak yang dilaporkan" className="w-full">
        <select
          value={contract?.code ?? ""}
          onChange={(e) => r.pickContract(e.target.value)}
        >
          {contracts.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} · {c.title}
            </option>
          ))}
        </select>
      </FormField>
      <div className="w-full grid gap-16 md:grid-cols-[repeat(2,minmax(0,1fr))]">
        <FormField
          label="Apa yang janggal?"
          error={shown("category")}
          className="w-full"
        >
          <select
            value={fields.category}
            onChange={(e) => r.set({ category: e.target.value })}
          >
            <option value="">Pilih jenis kejanggalan</option>
            {reportCategories.map((c) => (
              <option key={c.title} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="Pasal yang tidak sesuai"
          error={shown("clause")}
          className="w-full"
        >
          <select
            value={fields.clause}
            onChange={(e) => r.set({ clause: e.target.value })}
            disabled={!detail?.ok}
          >
            <option value="">
              {!detail
                ? "Memuat pasal…"
                : detail.ok
                  ? "Pilih pasal"
                  : "Pasal gagal dimuat"}
            </option>
            {contract?.clauses.map((cl, i) => (
              <option key={cl.title} value={cl.title}>
                Pasal {i + 1}. {cl.title}
              </option>
            ))}
          </select>
          {detail?.ok === false && (
            <ErrorText role="alert">{detail.error}</ErrorText>
          )}
        </FormField>
      </div>
    </>
  );
}
