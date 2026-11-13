import React, { useState } from "react";
import { Plus, Edit2, Trash2, BookCheck, Shield } from "lucide-react";
import {
  useMutabaahActivities,
  useDeleteMutabaahActivity,
} from "../api/mutabaah.api";
import { ActivityFormModal } from "../components/ActivityFormModal";
import type { MutabaahActivityDto, MutabaahActivityCategory } from "../types";

const CATEGORY_LABELS: Record<MutabaahActivityCategory, string> = {
  fardhu: "Fardhu (Wajib Berjama'ah)",
  sunnah: "Sunnah (Rawatib/Tahajjud)",
  quran: "Al-Qur'an (Tilawah/Muroja'ah)",
  dzikir: "Dzikir & Doa",
  kajian: "Kajian Kitab",
};

export const MutabaahActivitiesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<MutabaahActivityDto | null>(null);

  const { data: activities = [], isLoading } = useMutabaahActivities(
    selectedCategory || undefined
  );

  const deleteMutation = useDeleteMutabaahActivity();

  const handleEdit = (act: MutabaahActivityDto) => {
    setEditingActivity(act);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus amalan "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookCheck className="h-5 w-5 text-emerald-600" />
            Katalog Amalan Yaumiyah
          </h1>
          <p className="text-xs text-slate-500">
            Konfigurasi indikator amalan yaumiyah santri, pembobotan nilai, dan target harian
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-2xs"
        >
          <Plus className="h-4 w-4" />
          Tambah Amalan Baru
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <span className="text-xs font-semibold text-slate-500">Filter Kategori:</span>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-600 focus:outline-hidden"
        >
          <option value="">Semua Kategori</option>
          <option value="fardhu">Fardhu</option>
          <option value="sunnah">Sunnah</option>
          <option value="quran">Al-Qur'an</option>
          <option value="dzikir">Dzikir</option>
          <option value="kajian">Kajian</option>
        </select>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
          Memuat daftar amalan...
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          Belum ada amalan terdaftar.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-700">
              <tr>
                <th className="px-3 py-3 text-center">Urutan</th>
                <th className="px-4 py-3">Nama Amalan</th>
                <th className="px-3 py-3">Kategori</th>
                <th className="px-3 py-3 text-center">Bobot</th>
                <th className="px-3 py-3 text-center">Target Harian</th>
                <th className="px-3 py-3 text-center">Sifat</th>
                <th className="px-3 py-3 text-center">Khusus Gender</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {activities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-3 py-3 text-center font-bold text-slate-400">
                    {act.orderIndex}
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {act.name}
                  </td>

                  <td className="px-3 py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {CATEGORY_LABELS[act.category]}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-center">
                    <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                      {act.weight}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-center text-slate-600">
                    {act.targetCount} {act.unit}
                  </td>

                  <td className="px-3 py-3 text-center">
                    {act.isMandatory ? (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        Wajib
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        Sunnah
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-3 text-center">
                    <span className="text-[11px] text-slate-600 font-medium">
                      {act.genderSpecific === "all"
                        ? "Semua"
                        : act.genderSpecific === "L"
                        ? "Santri Putra (L)"
                        : "Santri Putri (P)"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(act)}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        title="Edit Amalan"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(act.id, act.name)}
                        className="rounded p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                        title="Hapus Amalan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ActivityFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activityToEdit={editingActivity}
      />
    </div>
  );
};
