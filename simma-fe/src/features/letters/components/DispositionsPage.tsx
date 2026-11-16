import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { useDispositions } from "../api/letters.api";
import { CreateDispositionModal } from "./CreateDispositionModal";
import { FollowUpDispositionModal } from "./FollowUpDispositionModal";
import type {
  Disposition,
  LetterUrgency,
  DispositionStatus,
} from "../types";

export const DispositionsPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDisp, setSelectedDisp] = useState<Disposition | null>(null);

  const { data: dispositions = [], isLoading } = useDispositions({
    status: filterStatus || undefined,
  });

  const getUrgencyBadge = (urg: LetterUrgency) => {
    switch (urg) {
      case "sangat_segera":
        return <Badge variant="danger">Sangat Segera</Badge>;
      case "segera":
        return <Badge variant="warning">Segera</Badge>;
      default:
        return <Badge variant="neutral">Biasa</Badge>;
    }
  };

  const getStatusBadge = (st: DispositionStatus) => {
    switch (st) {
      case "completed":
        return <Badge variant="success">Selesai</Badge>;
      case "in_progress":
        return <Badge variant="info">Sedang Diproses</Badge>;
      default:
        return <Badge variant="warning">Menunggu</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Semua Status Disposisi</option>
            <option value="pending">Menunggu Tindak Lanjut</option>
            <option value="in_progress">Sedang Diproses</option>
            <option value="completed">Selesai</option>
          </select>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium w-full sm:w-auto justify-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Disposisi Surat Kamad
        </button>
      </div>

      {/* Dispositions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">Sifat & Instruksi</th>
                <th className="px-4 py-3">Surat Terkait</th>
                <th className="px-4 py-3">Catatan Kamad</th>
                <th className="px-4 py-3">Batas Waktu</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Memuat data disposisi...
                  </td>
                </tr>
              ) : dispositions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Belum ada instruksi disposisi
                  </td>
                </tr>
              ) : (
                dispositions.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        {getUrgencyBadge(d.urgency)}
                      </div>
                      <span className="font-semibold text-slate-800 capitalize">
                        {d.instruction.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                      {d.incomingLetterId.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-slate-700">{d.notes || "-"}</p>
                      {d.followUpNotes && (
                        <p className="text-[11px] text-emerald-600 mt-1">
                          Laporan: {d.followUpNotes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {d.deadline ? d.deadline.split("T")[0] : "-"}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(d.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedDisp(d)}
                        className="text-xs text-emerald-600 hover:text-emerald-800 font-medium cursor-pointer"
                      >
                        Tindak Lanjut
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateDispositionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <FollowUpDispositionModal
        disposition={selectedDisp}
        onClose={() => setSelectedDisp(null)}
      />
    </div>
  );
};
