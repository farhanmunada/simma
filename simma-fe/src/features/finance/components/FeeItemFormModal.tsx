import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { useCreateFeeItem, useUpdateFeeItem } from "../api/finance.api";
import type { FeeItemDto, FeeType, FeeCategory } from "../types";

interface FeeItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeItemToEdit?: FeeItemDto | null;
}

export const FeeItemFormModal: React.FC<FeeItemFormModalProps> = ({
  isOpen,
  onClose,
  feeItemToEdit,
}) => {
  const isEdit = Boolean(feeItemToEdit);
  const [name, setName] = useState(feeItemToEdit?.name || "");
  const [code, setCode] = useState(feeItemToEdit?.code || "");
  const [type, setType] = useState<FeeType>(feeItemToEdit?.type || "rutin");
  const [category, setCategory] = useState<FeeCategory>(feeItemToEdit?.category || "spp");
  const [amount, setAmount] = useState(feeItemToEdit?.amount || 0);
  const [gradeLevel, setGradeLevel] = useState<number | undefined>(
    feeItemToEdit?.gradeLevel ?? undefined
  );
  const [description, setDescription] = useState(feeItemToEdit?.description || "");
  const [errorMsg, setErrorMsg] = useState("");

  const createMutation = useCreateFeeItem();
  const updateMutation = useUpdateFeeItem();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !code.trim()) {
      setErrorMsg("Nama dan kode pos biaya wajib diisi.");
      return;
    }

    try {
      if (isEdit && feeItemToEdit) {
        await updateMutation.mutateAsync({
          id: feeItemToEdit.id,
          name: name.trim(),
          code: code.trim().toUpperCase(),
          type,
          category,
          amount: Number(amount),
          gradeLevel: gradeLevel ? Number(gradeLevel) : null,
          description: description.trim() || null,
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          type,
          category,
          amount: Number(amount),
          gradeLevel: gradeLevel ? Number(gradeLevel) : null,
          description: description.trim() || null,
        });
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan pos biaya";
      setErrorMsg(msg);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800">
            {isEdit ? "Edit Pos Biaya" : "Tambah Pos Biaya"}
          </h3>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Kode Pos</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Misal: SPP-10, ASRAMA-11"
              disabled={isEdit}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Nama Pos Biaya</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: SPP Bulanan Kelas X"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Tipe</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as FeeType)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="rutin">Rutin (Bulanan)</option>
                <option value="non_rutin">Non Rutin (Sekali/Tahunan)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeeCategory)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="spp">SPP</option>
                <option value="asrama">Asrama</option>
                <option value="komite">Komite</option>
                <option value="uang_pangkal">Uang Pangkal</option>
                <option value="seragam">Seragam</option>
                <option value="buku">Buku</option>
                <option value="ujian">Ujian</option>
                <option value="kegiatan">Kegiatan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Nominal (Rp)</label>
              <input
                type="number"
                min="0"
                step="5000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

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
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Keterangan</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Catatan tambahan pos biaya..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
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
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{isPending ? "Menyimpan..." : "Simpan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
