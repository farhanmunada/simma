import React, { useState } from "react";
import { X, Layers } from "lucide-react";
import { useGenerateInvoices, useFeeItems } from "../api/finance.api";

interface GenerateInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GenerateInvoicesModal: React.FC<GenerateInvoicesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [feeItemId, setFeeItemId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState<number | undefined>(new Date().getMonth() + 1);
  const [gradeLevel, setGradeLevel] = useState<number | undefined>(undefined);
  const [dueDate, setDueDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successInfo, setSuccessInfo] = useState<{ total: number; generated: number; skipped: number } | null>(null);

  const { data: feeItems = [] } = useFeeItems();
  const generateMutation = useGenerateInvoices();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessInfo(null);

    if (!feeItemId) {
      setErrorMsg("Pilih pos biaya yang akan di-generate.");
      return;
    }

    try {
      const res = await generateMutation.mutateAsync({
        feeItemId,
        year: Number(year),
        month: month ? Number(month) : undefined,
        gradeLevel: gradeLevel ? Number(gradeLevel) : undefined,
        dueDate: dueDate || undefined,
      });
      setSuccessInfo({
        total: res.totalEligible,
        generated: res.generated,
        skipped: res.skipped,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal generate tagihan masal";
      setErrorMsg(msg);
    }
  };

  const selectedFee = feeItems.find((f) => f.id === feeItemId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800">Generate Tagihan Masal</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{errorMsg}</div>
        )}

        {successInfo ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-emerald-50 p-4 text-emerald-800">
              <p className="font-semibold">Berhasil Generate Tagihan!</p>
              <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                <li>Total siswa eligible: {successInfo.total}</li>
                <li>Tagihan terbuat: {successInfo.generated}</li>
                <li>Dilewati (sudah ada): {successInfo.skipped}</li>
              </ul>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Selesai & Tutup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Pos Biaya</label>
              <select
                value={feeItemId}
                onChange={(e) => setFeeItemId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                required
              >
                <option value="">-- Pilih Pos Biaya --</option>
                {feeItems.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code}) - Rp {f.amount.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Tahun</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Bulan (Rutin)</label>
                <select
                  value={month ?? ""}
                  onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : undefined)}
                  disabled={selectedFee?.type === "non_rutin"}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none disabled:bg-slate-100"
                >
                  <option value="">Bukan Bulanan</option>
                  {[
                    "Januari",
                    "Februari",
                    "Maret",
                    "April",
                    "Mei",
                    "Juni",
                    "Juli",
                    "Agustus",
                    "September",
                    "Oktober",
                    "November",
                    "Desember",
                  ].map((m, i) => (
                    <option key={m} value={i + 1}>
                      {i + 1} - {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Tingkat Kelas</label>
                <select
                  value={gradeLevel ?? ""}
                  onChange={(e) => setGradeLevel(e.target.value ? Number(e.target.value) : undefined)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Semua Tingkat</option>
                  <option value="10">Kelas 10 (X)</option>
                  <option value="11">Kelas 11 (XI)</option>
                  <option value="12">Kelas 12 (XII)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Jatuh Tempo</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={generateMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Layers className="h-4 w-4" />
                <span>{generateMutation.isPending ? "Memproses..." : "Generate Masal"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
