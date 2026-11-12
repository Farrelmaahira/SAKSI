import PillButton from "@/components/atoms/PillButton";
import ReportListItem from "@/components/molecules/ReportListItem";
import type { SealedContract } from "@/interfaces/contract";

interface Props {
  c: SealedContract;
  onReport: () => void;
}

/* Citizen reports on this contract, and the button to add one */
export default function CitizenReports({ c, onReport }: Props) {
  return (
    <div className="bg-soft rounded-[1.6rem] grid gap-20 justify-items-start mt-20 p-28">
      <p className="text-[1.3rem] uppercase">
        Laporan warga ({c.reports.length})
      </p>
      {c.reports.length === 0 ? (
        <p className="text-[1.6rem] opacity-[0.7]">
          Belum ada laporan untuk kontrak ini.
        </p>
      ) : (
        <ul className="grid gap-14 list-none list-outside w-full [&>li]:bg-white [&>li]:rounded-[1.2rem] [&>li]:p-20 [&_strong]:block [&_strong]:text-[1.8rem] [&_strong]:font-[400] [&_strong]:mt-8 [&_strong]:mx-0 [&_strong]:mb-6 [&_p]:text-[1.5rem] [&_p]:leading-[1.5]">
          {c.reports.map((r) => (
            <ReportListItem key={r.id} report={r} />
          ))}
        </ul>
      )}
      <PillButton tone="blue" onClick={onReport}>
        Laporkan kejanggalan
      </PillButton>
    </div>
  );
}
