import Btn from "@/components/atoms/Btn";
import Empty from "@/components/molecules/Empty";
import PageHead from "@/components/molecules/PageHead";
import Panel from "@/components/molecules/Panel";

interface ReportSentProps {
  code: string;
  onAnother: () => void;
}

export default function ReportSent({ code, onAnother }: ReportSentProps) {
  return (
    <>
      <PageHead label="Buat laporan" title="Laporan terkirim" />
      <Panel>
        <Empty
          art="document-ready_o5d5"
          title={`Kode laporan ${code}`}
          text="Kode ini hanya nomor referensi. Pantau status dan tanggapan di Laporan Saya, kami kabari lewat notifikasi."
          action={
            <div className="items-center flex flex-wrap gap-10">
              <Btn to="/dashboard/laporan">Lihat laporan saya</Btn>
              <Btn variant="ghost" onClick={onAnother}>
                Buat laporan lain
              </Btn>
            </div>
          }
        />
      </Panel>
    </>
  );
}
