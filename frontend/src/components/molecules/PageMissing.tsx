import Empty from "@/components/molecules/Empty";
import Btn from "@/components/atoms/Btn";

export default function PageMissing() {
  return (
    <Empty
      art="document-warning_2es6"
      title="Halaman tidak ditemukan."
      text="Alamat ini tidak ada di dashboard."
      action={<Btn to="/dashboard">Ke beranda</Btn>}
    />
  );
}
