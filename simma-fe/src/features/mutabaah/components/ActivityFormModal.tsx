import React, { useState } from "react";
import { X, Check } from "lucide-react";
import {
  useCreateMutabaahActivity,
  useUpdateMutabaahActivity,
} from "../api/mutabaah.api";
import type { MutabaahActivityDto, MutabaahActivityCategory } from "../types";

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityToEdit?: MutabaahActivityDto | null;
}

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  onClose,
  activityToEdit,
}) => {
  const isEdit = Boolean(activityToEdit);
  const [name, setName] = useState(activityToEdit?.name || "");
  const [category, setCategory] = useState<MutabaahActivityCategory>(
    activityToEdit?.category || "fardhu"
  );
  const [targetCount, setTargetCount] = useState(activityToEdit?.targetCount || 1);
  const [unit, setUnit] = useState(activityToEdit?.unit || "waktu");
  const [weight, setWeight] = useState(activityToEdit?.weight || 3);
  const [isMandatory, setIsMandatory] = useState(
    activityToEdit?.isMandatory !== undefined ? activityToEdit.isMandatory : true
  );
  const [genderSpecific, setGenderSpecific] = useState<"all" | "L" | "P">(
    activityToEdit?.genderSpecific || "all"
  );
  const [orderIndex, setOrderIndex] = useState(activityToEdit?.orderIndex || 1);
  const [errorMsg, setErrorMsg] = useState("");

  const createMutation = useCreateMutabaahActivity();
  const updateMutation = useUpdateMutabaahActivity();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Nama amalan tidak boleh kosong.");
      return;
    }

    try {
      if (isEdit && activityToEdit) {
        await updateMutation.mutateAsync({
          id: activityToEdit.id,
          name: name.trim(),
          category,
          targetCount,
          unit: unit.trim(),
          weight,
          isMandatory,
          genderSpecific,
          orderIndex,
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          category,
          targetCount,
          unit: unit.trim(),
          weight,
          isMandatory,
          genderSpecific,
          orderIndex,
          isActive: true,
        });
      }
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || "Gagal menyimpan amalan yaumiyah.");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-800">
            {isEdit ? "Edit Amalan Yaumiyah" : "Tambah Amalan Yaumiyah Baru"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nama Amalan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Shalat Qiyamul Lail"
              required
              className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MutabaahActivityCategory)}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="fardhu">Fardhu (Wajib Berjama'ah)</option>
                <option value="sunnah">Sunnah (Rawatib/Tahajjud)</option>
                <option value="quran">Al-Qur'an (Tilawah/Muroja'ah)</option>
                <option value="dzikir">Dzikir & Doa</option>
                <option value="kajian">Kajian Kitab</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Bobot Nilai (1 - 5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Target Harian
              </label>
              <input
                type="number"
                min={1}
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Satuan Ukuran
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="waktu, halaman, rakaat"
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Khusus Gender
              </label>
              <select
                value={genderSpecific}
                onChange={(e) => setGenderSpecific(e.target.value as "all" | "L" | "P")}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="all">Semua Santri (Ikhwan & Akhwat)</option>
                <option value="L">Khusus Santri Putra (Ikhwan)</option>
                <option value="P">Khusus Santri Putri (Akhwat)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Urutan Tampil
              </label>
              <input
                type="number"
                min={0}
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isMandatory"
              checked={isMandatory}
              onChange={(e) => setIsMandatory(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isMandatory" className="text-xs font-medium text-slate-700">
              Kewajiban Mutlak (Masuk pembagi skor Istiqamah)
            </label>
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
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              <Check className="h-4 w-4" />
              {isPending ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan Amalan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
