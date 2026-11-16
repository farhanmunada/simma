import React from "react";
import { FileText, CheckCircle2, ShieldCheck, Download, ExternalLink } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import type { TransferItem } from "../types";

interface TransferTableProps {
  transfers: TransferItem[];
  isLoading: boolean;
  onOpenClearance: (item: TransferItem) => void;
  onOpenApproval: (item: TransferItem) => void;
  onDownloadPdf: (item: TransferItem) => void;
}

const statusMap: Record<string, { label: string; variant: "neutral" | "warning" | "info" | "success" | "danger" }> = {
  draft: { label: "Draft", variant: "neutral" },
  pending_clearance: { label: "Pending Clearance", variant: "warning" },
  pending_approval: { label: "Menunggu Persetujuan", variant: "info" },
  approved: { label: "Disetujui", variant: "success" },
  rejected: { label: "Ditolak", variant: "danger" },
  completed: { label: "Selesai", variant: "success" },
};

export const TransferTable: React.FC<TransferTableProps> = ({
  transfers,
  isLoading,
  onOpenClearance,
  onOpenApproval,
  onDownloadPdf,
}) => {
  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-2"></div>
        <p className="text-sm">Memuat data mutasi...</p>
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 border rounded-lg bg-slate-50/50">
        <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-medium">Tidak ada data mutasi yang ditemukan.</p>
        <p className="text-xs text-slate-400 mt-0.5">Silakan sesuaikan filter atau tambahkan permohonan baru.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left">No. Referensi</th>
            <th className="px-4 py-3 text-left">Tipe</th>
            <th className="px-4 py-3 text-left">Siswa & NISN</th>
            <th className="px-4 py-3 text-left">Asal / Tujuan</th>
            <th className="px-4 py-3 text-left">Tanggal</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-center">Clearance</th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {transfers.map((item) => {
            const statusConfig = statusMap[item.status] || { label: item.status, variant: "neutral" };
            const isKeluar = item.type === "keluar";
            const clr = item.clearance;
            const clearedCount = clr
              ? [clr.libraryCleared, clr.financeCleared, clr.disciplineCleared].filter(Boolean).length
              : 0;

            return (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium text-slate-700 whitespace-nowrap">
                  {item.referenceNumber}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant={isKeluar ? "danger" : "success"} size="sm">
                    {isKeluar ? "Mutasi Keluar" : "Mutasi Masuk"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{item.studentName}</p>
                  <p className="text-xs text-slate-500 font-mono">
                    NISN: {item.studentNisn ?? "-"} | Kelas: {item.currentClassroomName ?? item.targetClassroomName ?? "-"}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {isKeluar ? (
                    <span>Ke: <strong className="text-slate-800">{item.destinationSchool || "-"}</strong></span>
                  ) : (
                    <span>Dari: <strong className="text-slate-800">{item.originSchool || "-"}</strong></span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                  {item.transferDate}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant={statusConfig.variant} size="sm">
                    {statusConfig.label}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  {isKeluar ? (
                    <button
                      onClick={() => onOpenClearance(item)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-slate-300 hover:bg-slate-100 transition-colors"
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${clearedCount === 3 ? "text-emerald-600" : "text-amber-500"}`} />
                      <span>{clearedCount}/3</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                  {isKeluar && item.status === "pending_approval" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenApproval(item)}
                      className="text-purple-600 border-purple-200 hover:bg-purple-50 text-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      Approval
                    </Button>
                  )}
                  {isKeluar && (item.status === "approved" || item.status === "completed") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownloadPdf(item)}
                      className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      PDF
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenClearance(item)}
                    className="text-xs text-slate-600"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
