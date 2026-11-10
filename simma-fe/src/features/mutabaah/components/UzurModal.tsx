import React, { useState } from "react";
import { X, Calendar, AlertCircle } from "lucide-react";
import { useCreateUzurRecord } from "../api/mutabaah.api";
import type { MutabaahUzurType } from "../types";

interface UzurModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  gender: string;
  defaultDate?: string;
}

export const UzurModal: React.FC<UzurModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  gender,
  defaultDate,
}) => {
  const today = defaultDate || new Date().toISOString().slice(0, 10);
  const [uzurType, setUzurType] = useState<MutabaahUzurType>(
    gender === "P" ? "haidh" : "sakit"
  );
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const createUzurMutation = useCreateUzurRecord();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (gender === "L" && uzurType === "haidh") {
      setErrorMsg("Uzur haidh hanya berlaku untuk santriwati (akhwat).");
      return;
    }

    if (!startDate) {
      setErrorMsg("Tanggal mulai uzur wajib diisi.");
      return;
    }

    try {
      await createUzurMutation.mutateAsync({
        studentId,
        uzurType,
        startDate,
        endDate: endDate ? endDate : undefined,
        notes: notes ? notes : undefined,
      });
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || "Gagal menyimpan dispensasi uzur.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Dispensasi Uzur Syar&apos;i
            </h3>
            <p className="text-xs text-slate-500">
              {studentName} ({gender === "P" ? "Akhwat / Santriwati" : "Ikhwan / Santri"})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Jenis Uzur
            </label>
            <select
              value={uzurType}
              onChange={(e) => setUzurType(e.target.value as MutabaahUzurType)}
              className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-hidden"
            >
              {gender === "P" && <option value="haidh">Haidh (Dispensasi Khusus Akhwat)</option>}
              <option value="sakit">Sakit</option>
              <option value="safar">Safar (Perjalanan Jauh)</option>
              <option value="lainnya">Lainnya (Izin Tertulis)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Tanggal Mulai
              </label>
              <div className="relative mt-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Tanggal Selesai (Opsional)
              </label>
              <div className="relative mt-1">
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Keterangan / Catatan Musyrif
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Haidh hari ke-1, istirahat di kamar asrama..."
              className="mt-1 block w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createUzurMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              <Calendar className="h-4 w-4" />
              {createUzurMutation.isPending ? "Menyimpan..." : "Simpan Uzur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
