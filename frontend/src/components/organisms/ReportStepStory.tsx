import ReportField from "@/components/molecules/ReportField";
import PhotoDrop from "@/components/molecules/PhotoDrop";
import ToggleSwitch from "@/components/molecules/ToggleSwitch";
import type { useReportForm } from "@/hooks/use-report-form";
import type { SealedContract } from "@/interfaces/contract";

interface ReportStepStoryProps {
  contract: SealedContract;
  form: ReturnType<typeof useReportForm>;
}

const HINT = "text-[1.3rem] leading-[1.45] opacity-[0.65]";

export default function ReportStepStory({
  contract,
  form: f,
}: ReportStepStoryProps) {
  const { clause, text, location } = f.fields;
  return (
    <div className="[animation:pop_0.3s_ease-out] grid gap-24">
      <ReportField label="Pasal yang tidak sesuai">
        <select
          value={clause}
          onChange={(e) => f.set({ clause: e.target.value })}
        >
          <option value="">Pilih pasal</option>
          {contract.clauses.map((cl, i) => (
            <option key={cl.title} value={cl.title}>
              Pasal {i + 1}. {cl.title}
            </option>
          ))}
        </select>
        {clause && (
          <small className={HINT}>
            {contract.clauses.find((c) => c.title === clause)?.text}
          </small>
        )}
      </ReportField>
      <ReportField label="Ceritakan yang Anda lihat">
        <textarea
          rows={4}
          value={text}
          onChange={(e) => f.set({ text: e.target.value })}
          placeholder="Contoh: Pasir yang datang hanya setengah truk, padahal di kontrak tertulis 6 m³."
        />
        <small className={HINT}>
          {text.trim().length < f.minStory
            ? `Minimal ${f.minStory} karakter.`
            : "Sudah cukup jelas."}
        </small>
      </ReportField>
      <ReportField label="Lokasi (opsional)">
        <input
          value={location}
          onChange={(e) => f.set({ location: e.target.value })}
          placeholder="Contoh: Jalan Dusun Krajan, dekat masjid"
        />
      </ReportField>
      <PhotoDrop
        photos={f.photos.urls}
        onFiles={f.photos.add}
        onRemove={f.photos.remove}
      />
      <ToggleSwitch
        label="Sembunyikan identitas saya"
        checked={f.anonymous}
        onChange={f.setAnonymous}
      />
      {!f.anonymous && (
        <ReportField label="Nama atau sebutan">
          <input
            value={f.name}
            onChange={(e) => f.setName(e.target.value)}
            placeholder="Contoh: Warga RT 03"
          />
        </ReportField>
      )}
    </div>
  );
}
