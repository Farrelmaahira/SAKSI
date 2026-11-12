import Btn from "@/components/atoms/Btn";
import Callout from "@/components/atoms/Callout";
import FormAlert from "@/components/atoms/FormAlert";
import FormField from "@/components/molecules/FormField";
import ReportTargetFields from "@/components/organisms/ReportTargetFields";
import PhotoDrop from "@/components/molecules/PhotoDrop";
import type { useBuatLaporan } from "@/hooks/use-buat-laporan";

interface Props {
  report: ReturnType<typeof useBuatLaporan>;
}

export default function BuatLaporanForm({ report: r }: Props) {
  const { fields, errors, tried, photos } = r;
  const shown = (field: keyof typeof errors) => (tried ? errors[field] : "");
  return (
    <form
      className="grid gap-16 justify-items-start"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        r.submit();
      }}
    >
      <ReportTargetFields report={r} />
      <FormField
        label="Ceritakan yang Anda lihat"
        error={shown("text")}
        className="w-full"
      >
        <textarea
          rows={4}
          value={fields.text}
          onChange={(e) => r.set({ text: e.target.value })}
          placeholder="Contoh: Pasir yang datang hanya setengah truk, padahal di kontrak tertulis 6 m³."
        />
      </FormField>
      <FormField label="Lokasi (opsional)" className="w-full">
        <input
          value={fields.location}
          onChange={(e) => r.set({ location: e.target.value })}
          placeholder="Contoh: Jalan Dusun Krajan, dekat masjid"
        />
      </FormField>
      <PhotoDrop
        photos={photos.urls}
        onFiles={photos.add}
        onRemove={photos.remove}
      />
      <Callout tone="green" icon="shield" className="w-full">
        Identitas Anda tidak ditampilkan ke pemerintah desa. Hanya BPD dan
        Inspektorat yang dapat melihatnya.
      </Callout>
      {r.sendError && <FormAlert>{r.sendError}</FormAlert>}
      <div className="items-center flex flex-wrap gap-10">
        <Btn type="submit" icon="arrow" disabled={r.sending}>
          {r.sending ? "Mengirim…" : "Kirim laporan"}
        </Btn>
        <Btn to="/dashboard" variant="ghost">
          Batal
        </Btn>
      </div>
    </form>
  );
}
