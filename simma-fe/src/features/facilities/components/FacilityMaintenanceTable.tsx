import React from "react";
import { Wrench, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import type { FacilityMaintenanceTicket, FacilityAsset } from "../types";

interface FacilityMaintenanceTableProps {
  tickets: FacilityMaintenanceTicket[];
  assets: FacilityAsset[];
  isLoading: boolean;
  onUpdateStatus: (ticket: FacilityMaintenanceTicket, status: string) => void;
}

export const FacilityMaintenanceTable: React.FC<FacilityMaintenanceTableProps> = ({
  tickets,
  assets,
  isLoading,
  onUpdateStatus,
}) => {
  const getAssetName = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    return asset ? `${asset.name} (${asset.code})` : assetId;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "DARURAT":
        return <Badge variant="danger">Darurat</Badge>;
      case "TINGGI":
        return <Badge variant="warning">Tinggi</Badge>;
      case "SEDANG":
        return <Badge variant="info">Sedang</Badge>;
      case "RENDAH":
        return <Badge variant="neutral">Rendah</Badge>;
      default:
        return <Badge variant="neutral">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "MENUNGGU":
        return <Badge variant="neutral">Menunggu</Badge>;
      case "PROSES":
        return <Badge variant="info">Dalam Perbaikan</Badge>;
      case "SELESAI":
        return <Badge variant="success">Selesai</Badge>;
      case "DITOLAK":
        return <Badge variant="danger">Ditolak</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Aset & Kerusakan</th>
            <th className="px-4 py-3">Prioritas</th>
            <th className="px-4 py-3">Pelapor</th>
            <th className="px-4 py-3">Biaya</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Tindakan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                Memuat tiket pemeliharaan...
              </td>
            </tr>
          ) : tickets.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                Belum ada tiket pemeliharaan aset.
              </td>
            </tr>
          ) : (
            tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{ticket.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {getAssetName(ticket.assetId)}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 italic">
                    "{ticket.description}"
                  </div>
                </td>
                <td className="px-4 py-3">{getPriorityBadge(ticket.priority)}</td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {ticket.reporterName || "Staff"}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-slate-700">
                  Rp {ticket.cost.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">{getStatusBadge(ticket.status)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {ticket.status === "MENUNGGU" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(ticket, "PROSES")}
                          className="text-xs text-blue-600 hover:text-blue-700 border-blue-300"
                          title="Mulai Servis"
                        >
                          <Wrench className="w-3.5 h-3.5 mr-1" />
                          Proses
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUpdateStatus(ticket, "DITOLAK")}
                          className="text-xs text-rose-600 hover:text-rose-700"
                          title="Tolak Laporan"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                    {ticket.status === "PROSES" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(ticket, "SELESAI")}
                        className="text-xs text-emerald-600 hover:text-emerald-700 border-emerald-300"
                        title="Tandai Selesai Diperbaiki"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Selesai
                      </Button>
                    )}
                    {(ticket.status === "SELESAI" ||
                      ticket.status === "DITOLAK") && (
                      <span className="text-xs text-slate-400 italic">
                        Ditutup
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
