import React from "react";
import { Badge } from "../../../components/ui/Badge";
import type { SanctionLevel, InfractionStatus } from "@simma/shared";

export function SanctionBadge({ level }: { level: SanctionLevel }) {
  switch (level) {
    case "sp_3":
      return <Badge variant="danger" className="bg-rose-900 text-white border-rose-950 font-bold">SP-3 (Drop Out)</Badge>;
    case "sp_2":
      return <Badge variant="danger" className="bg-red-600 text-white border-red-700 font-semibold">SP-2 (Skorsing)</Badge>;
    case "sp_1":
      return <Badge variant="warning" className="bg-amber-500 text-white border-amber-600 font-medium">SP-1 (Peringatan)</Badge>;
    case "teguran_lisan":
      return <Badge variant="warning">Teguran Lisan</Badge>;
    case "normal":
    default:
      return <Badge variant="success">Normal (Taat)</Badge>;
  }
}

export function InfractionStatusBadge({ status }: { status: InfractionStatus }) {
  switch (status) {
    case "approved":
      return <Badge variant="success">Disetujui</Badge>;
    case "rejected":
      return <Badge variant="danger">Ditolak</Badge>;
    case "pending_approval":
    default:
      return <Badge variant="warning">Menunggu Otorisasi</Badge>;
  }
}
