import React, { useState } from "react";
import {
  useEmisBapList,
  useCreateBapDraft,
  useApproveBap,
  downloadBapPdf,
} from "../api/emis.api";
import type { EmisBapRecord } from "../types";

interface BapApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export const BapApprovalModal: React.FC<BapApprovalModalProps> = ({
  isOpen,
  onClose,
  userRole,
}) => {
  const { data: bapData, isLoading, refetch } = useEmisBapList();
  const createBapMutation = useCreateBapDraft();
  const approveBapMutation = useApproveBap();

  const [notes, setNotes] = useState<string>("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const records: EmisBapRecord[] = bapData?.data || [];
  const canApprove = userRole === "kepala_madrasah" || userRole === "super_admin";

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg(null);
      await createBapMutation.mutateAsync({ notes: notes || undefined });
      setNotes("");
      refetch();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal membuat draf BAP.");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setErrorMsg(null);
      await approveBapMutation.mutateAsync({
        id,
        data: { approved: true, notes: "Disetujui secara digital oleh Kepala Madrasah" },
      });
      refetch();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyetujui BAP.");
    }
  };

  const handleDownloadPdf = async (item: EmisBapRecord) => {
    try {
      setErrorMsg(null);
      setDownloadingId(item.id);
      await downloadBapPdf(item.id, item.bapNumber);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengunduh dokumen PDF BAP.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Berita Acara Pendataan (BAP) EMIS 4.0
            </h3>
            <p className="text-xs text-gray-500">
              Penerbitan dokumen legalitas pendataan semesteran ber-barcode verifikasi.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <div className="overflow-y-auto flex-1 my-4 space-y-6">
          <form
            onSubmit={handleCreateDraft}
            className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Terbitkan Draf BAP Baru
              </h4>
              <button
                type="submit"
                disabled={createBapMutation.isPending}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {createBapMutation.isPending ? "Menerbitkan..." : "+ Buat Draf BAP"}
              </button>
            </div>
            <input
              type="text"
              placeholder="Catatan tambahan BAP (opsional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white"
            />
          </form>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
              Riwayat Berita Acara Pendataan
            </h4>

            {isLoading ? (
              <p className="text-xs text-gray-500 py-4 text-center">Memuat daftar BAP...</p>
            ) : records.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center bg-gray-50 rounded-lg">
                Belum ada berkas BAP yang diterbitkan.
              </p>
            ) : (
              <div className="space-y-3">
                {records.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">
                          {item.bapNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            item.status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        TA {item.academicYear} ({item.semester}) • {item.totalStudents} Siswa •{" "}
                        {item.totalTeachers} GTK • Kesiapan: {item.readinessPercentage}%
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Operator: {item.operatorName} • Kepala: {item.headmasterName}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === "draft" && canApprove && (
                        <button
                          onClick={() => handleApprove(item.id)}
                          disabled={approveBapMutation.isPending}
                          className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                        >
                          Setujui
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadPdf(item)}
                        disabled={downloadingId === item.id}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        {downloadingId === item.id ? "Mengunduh..." : "Cetak PDF"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
