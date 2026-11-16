import React, { useState } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { useExpeditions } from "../api/letters.api";
import { CreateExpeditionModal } from "./CreateExpeditionModal";
import type { ExpeditionBook } from "../types";

export const ExpeditionPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading } = useExpeditions();
  const expeditions: ExpeditionBook[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Buku Ekspedisi Pengiriman Surat</h3>
          <p className="text-xs text-slate-500">Pencatatan pengiriman fisik dan tanda terima naskah dinas madrasah.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Catat Ekspedisi
        </button>
      </div>

      {/* Expeditions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">Tanggal Kirim</th>
                <th className="px-4 py-3">Penerima & Instansi</th>
                <th className="px-4 py-3">Petugas / Kurir</th>
                <th className="px-4 py-3">ID Surat Keluar</th>
                <th className="px-4 py-3">Bukti / Resi Penerimaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Memuat catatan ekspedisi...
                  </td>
                </tr>
              ) : expeditions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    Belum ada pengiriman naskah dinas tercatat
                  </td>
                </tr>
              ) : (
                expeditions.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {row.dispatchDate}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{row.recipientName}</p>
                      {row.notes && <p className="text-[11px] text-slate-400">{row.notes}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.courierName}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {row.outgoingLetterId.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3">
                      {row.recipientProof ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{row.recipientProof}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Belum ada bukti</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateExpeditionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
