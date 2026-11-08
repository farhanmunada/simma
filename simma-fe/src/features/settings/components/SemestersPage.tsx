import React, { useState, useMemo } from "react";
import {
  Plus,
  CheckCircle,
  Calendar,
  AlertCircle,
  Pencil,
  Trash2,
  Search,
  Sparkles,
} from "lucide-react";
import {
  useSemesters,
  useAcademicYears,
  useCreateSemester,
  useUpdateSemester,
  useDeleteSemester,
  usePatchSemesterStatus,
} from "../api/settings.api";
import type { Semester } from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";

export const SemestersPage: React.FC = () => {
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Semester | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Semester | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form fields
  const [academicYearId, setAcademicYearId] = useState("");
  const [semesterType, setSemesterType] = useState<"1" | "2">("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Queries & Mutations
  const { data: semesters = [], isLoading, isError, error } = useSemesters();
  const { data: academicYears = [] } = useAcademicYears();
  const createMutation = useCreateSemester();
  const updateMutation = useUpdateSemester();
  const deleteMutation = useDeleteSemester();
  const activateMutation = usePatchSemesterStatus();

  // Map academic year id to name
  const ayMap = useMemo(() => {
    const map = new Map<string, string>();
    academicYears.forEach((ay) => map.set(ay.id, ay.name));
    return map;
  }, [academicYears]);

  // Filtered list
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return semesters;
    const q = searchTerm.toLowerCase();
    return semesters.filter((item) => {
      const ayName = ayMap.get(item.academicYearId)?.toLowerCase() || "";
      const typeStr = item.type === 1 ? "ganjil 1" : "genap 2";
      return ayName.includes(q) || typeStr.includes(q);
    });
  }, [semesters, ayMap, searchTerm]);

  const showNotification = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenCreateModal = () => {
    const defaultAy = academicYears.find((ay) => ay.isActive)?.id || academicYears[0]?.id || "";
    setEditingItem(null);
    setAcademicYearId(defaultAy);
    setSemesterType("1");
    setStartDate("");
    setEndDate("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Semester) => {
    setEditingItem(item);
    setAcademicYearId(item.academicYearId);
    setSemesterType(String(item.type) as "1" | "2");
    setStartDate(item.startDate ? item.startDate.split("T")[0] : "");
    setEndDate(item.endDate ? item.endDate.split("T")[0] : "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!academicYearId) {
      setFormError("Tahun ajaran wajib dipilih.");
      return;
    }
    if (!startDate || !endDate) {
      setFormError("Tanggal mulai dan tanggal selesai wajib diisi.");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setFormError("Tanggal selesai harus lebih besar dari tanggal mulai.");
      return;
    }

    try {
      const typeNum = Number(semesterType) as 1 | 2;
      const ayName = ayMap.get(academicYearId) || "";
      const typeLabel = typeNum === 1 ? "Ganjil" : "Genap";

      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          data: {
            academicYearId,
            type: typeNum,
            startDate,
            endDate,
          },
        });
        showNotification("success", `Semester ${typeLabel} (${ayName}) berhasil diperbarui.`);
      } else {
        await createMutation.mutateAsync({
          academicYearId,
          type: typeNum,
          startDate,
          endDate,
          isActive: false,
        });
        showNotification("success", `Semester ${typeLabel} (${ayName}) berhasil ditambahkan.`);
      }
      handleCloseModal();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal menyimpan semester.");
    }
  };

  const handleActivate = async (id: string, ayName: string, type: number) => {
    try {
      await activateMutation.mutateAsync({ id, isActive: true });
      const label = type === 1 ? "Ganjil" : "Genap";
      showNotification("success", `Semester ${label} (${ayName}) sekarang aktif.`);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      showNotification("error", apiErr?.message || "Gagal mengaktifkan semester.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      const ayName = ayMap.get(deleteTarget.academicYearId) || "";
      const label = deleteTarget.type === 1 ? "Ganjil" : "Genap";
      showNotification("success", `Semester ${label} (${ayName}) berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      showNotification("error", apiErr?.message || "Gagal menghapus semester.");
    }
  };

  const academicYearOptions = academicYears.map((ay) => ({
    value: ay.id,
    label: `${ay.name}${ay.isActive ? " (Aktif)" : ""}`,
  }));

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Semester</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {semesters.length} Data
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kelola periode semester ganjil dan genap tahun akademik madrasah
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          size="sm"
          className="gap-1.5 shadow-sm rounded-xl px-4 py-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Semester</span>
        </Button>
      </div>

      {/* Floating / Inline Notification */}
      {feedback && (
        <div
          className={`p-3 text-xs rounded-xl border flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari semester atau tahun ajaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Table Card */}
      <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span>Memuat data semester...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-600 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{(error as Error)?.message || "Gagal memuat data."}</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Belum Ada Semester</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {searchTerm
                  ? "Tidak ada data yang cocok dengan pencarian Anda."
                  : "Mulai dengan menambahkan semester untuk tahun ajaran yang aktif."}
              </p>
            </div>
            {!searchTerm && (
              <Button onClick={handleOpenCreateModal} size="sm" variant="outline" className="mt-2 rounded-xl text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Tambah Semester
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Tahun Ajaran</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Periode Mulai</th>
                  <th className="py-3 px-4">Periode Selesai</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item, idx) => {
                  const ayName = ayMap.get(item.academicYearId) || item.academicYearId;
                  const typeLabel = item.type === 1 ? "Ganjil (1)" : "Genap (2)";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{ayName}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                          {typeLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {item.startDate ? item.startDate.split("T")[0] : "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {item.endDate ? item.endDate.split("T")[0] : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.isActive ? (
                          <Badge variant="success" size="sm" className="font-medium">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm" className="font-medium">
                            Nonaktif
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {!item.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivate(item.id, ayName, item.type)}
                              isLoading={
                                activateMutation.isPending &&
                                activateMutation.variables?.id === item.id
                              }
                              className="rounded-lg h-7 px-2 text-[11px] hover:border-emerald-400 hover:text-emerald-700"
                              title="Aktifkan semester ini"
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              Aktifkan
                            </Button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Semester"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            title="Hapus Semester"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Tambah / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "Edit Semester" : "Tambah Semester Baru"}
        description={
          editingItem
            ? "Perbarui tanggal dan detail semester madrasah"
            : "Pilih tahun ajaran dan jenis semester baru yang akan didaftarkan"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {formError && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tahun Ajaran <span className="text-rose-500">*</span>
            </label>
            <select
              autoFocus
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            >
              {academicYearOptions.length > 0 ? (
                academicYearOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              ) : (
                <option value="">Belum ada tahun ajaran</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jenis Semester <span className="text-rose-500">*</span>
            </label>
            <select
              value={semesterType}
              onChange={(e) => setSemesterType(e.target.value as "1" | "2")}
              required
              className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            >
              <option value="1">Semester 1 - Ganjil</option>
              <option value="2">Semester 2 - Genap</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal Mulai <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal Selesai <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCloseModal}
              className="rounded-xl text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="rounded-xl text-xs"
            >
              {editingItem ? "Simpan Perubahan" : "Tambah Semester"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Semester"
        message={`Apakah Anda yakin ingin menghapus semester ${
          deleteTarget?.type === 1 ? "Ganjil" : "Genap"
        } (${ayMap.get(deleteTarget?.academicYearId || "") || ""})?`}
        confirmText="Hapus Semester"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
};
