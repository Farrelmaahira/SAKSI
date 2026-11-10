"use client";

import { useDash } from "@/hooks/use-dash";
import DesaHome from "@/components/organisms/DesaHome";
import PihakHome from "@/components/organisms/PihakHome";
import BpdHome from "@/components/organisms/BpdHome";
import InspHome from "@/components/organisms/InspHome";
import WargaHome from "@/components/organisms/WargaHome";
import AdminDaerahTemplate from "@/components/organisms/AdminDaerahTemplate";

export default function DashHomeTemplate() {
  const { session } = useDash();
  if (session.role.role === "perangkat_desa") return <DesaHome />;
  if (session.role.role === "pihak_kedua") return <PihakHome />;
  if (session.role.role === "bpd") return <BpdHome />;
  if (session.role.role === "warga") return <WargaHome />;
  if (session.role.role === "admin_daerah") return <AdminDaerahTemplate />;
  return <InspHome />;
}
