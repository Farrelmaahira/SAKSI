"use client";

import ApiRowList from "@/components/molecules/ApiRowList";
import Panel from "@/components/molecules/Panel";
import RegionRuleForm from "@/components/organisms/RegionRuleForm";
import { useRegionRules } from "@/hooks/use-region-rules";
import { formatRp } from "@/lib/contracts/format-rp";
import { fmtDate } from "@/lib/dates/fmt-date";

/* GET/POST /admin/region-rules: procurement thresholds per region. A new rule is a new row, history stays. */
export default function AdminRegionRules() {
  const rules = useRegionRules();
  return (
    <Panel title="Ambang pengadaan" desc="Batas nilai pembelian langsung dan penawaran untuk desa di wilayah Anda.">
      <ApiRowList
        result={rules.rules}
        loading="Memuat aturan…"
        empty="Belum ada aturan wilayah."
        toRow={(x) => ({
          key: x.id,
          title: x.regionNama,
          sub: `Langsung sampai ${formatRp(x.ambangPembelianLangsung)} · penawaran sampai ${formatRp(x.ambangPenawaran)}`,
          sub2: `${x.dasarHukum} · berlaku ${fmtDate(x.berlakuSejak)}`,
        })}
      />
      <RegionRuleForm rules={rules} />
    </Panel>
  );
}
