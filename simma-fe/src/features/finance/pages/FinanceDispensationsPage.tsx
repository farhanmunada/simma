import React, { useState } from "react";
import { Check, X, ShieldAlert, Clock, CheckCircle, XCircle } from "lucide-react";
import { useDispensations, useUpdateDispensationStatus } from "../api/finance.api";
import type { DispensationStatus } from "../types";

export const FinanceDispensationsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: dispensations = [], isLoading } = useDispensations();
  const updateStatusMutation = useUpdateDispensationStatus();

  const handleUpdateStatus = async (id: string, status: DispensationStatus) => {
    const actionText = status === "approved" ? "menyetujui" : "menolak";
    if (confirm(`Apakah Anda yakin ingin ${actionText} permohonan dispensasi ini?`)) {
      try {
        await updateStatusMutation.mutateAsync({
          id,
          status,
        });
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Gagal memperbarui status dispensasi");
      }
    }
  };

  const filteredDispensations = statusFilter
    ? dispensations.filter((d) => d.status === statusFilter)
    : dispensations;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dispensasi & Keringanan Biaya
          </h1>
          <p className="text-sm text-slate-500">
            Persetujuan penundaan atau keringanan pembayaran SPP bagi santri/siswa.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-xs font-semibold text-slate-600">Filter Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="pending">Menunggu (Pending)</option>
          <option value="approved">Disetujui (Approved)</option>
          <option value="rejected">Ditolak (Rejected)</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Tanggal Pengajuan</th>
                <th className="px-4 py-3">Nama Siswa</th>
                <th className="px-4 py-3">Alasan Keringanan</th>
                <th className="px-4 py-3">Catatan / Komitmen</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi Persetujuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat permohonan dispensasi...
                  </td>
                </tr>
              ) : filteredDispensations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada permohonan dispensasi ditemukan.
                  </td>
                </tr>
              ) : (
                filteredDispensations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(d.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      <p>{d.studentName || "-"}</p>
                      <span className="text-[11px] font-normal text-slate-400">
                        {d.classroomName || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{d.reason}</td>
                    <td className="px-4 py-3 text-slate-500">{d.notes || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          d.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : d.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {d.status === "pending" ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleUpdateStatus(d.id, "approved")}
                            disabled={updateStatusMutation.isPending}
                            className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 hover:bg-emerald-100"
                            title="Setujui"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Setujui</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(d.id, "rejected")}
                            disabled={updateStatusMutation.isPending}
                            className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-1 font-semibold text-red-700 hover:bg-red-100"
                            title="Tolak"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
