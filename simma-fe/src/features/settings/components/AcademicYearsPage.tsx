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
  useAcademicYears,
  useCreateAcademicYear,
  useUpdateAcademicYear,
  useDeleteAcademicYear,
  usePatchAcademicYearStatus,
} from "../api/settings.api";
import type { AcademicYear } from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";

export const AcademicYearsPage: React.FC = () => {
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademicYear | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AcademicYear | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Mutations & Queries
  const { data: academicYears = [], isLoading, isError, error } = useAcademicYears();
  const createMutation = useCreateAcademicYear();
  const updateMutation = useUpdateAcademicYear();
  const deleteMutation = useDeleteAcademicYear();
  const activateMutation = usePatchAcademicYearStatus();

  // Filtered list
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return academicYears;
    const q = searchTerm.toLowerCase();
    return academicYears.filter((item) => item.name.toLowerCase().includes(q));
  }, [academicYears, searchTerm]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setName("");
    setStartDate("");
    setEndDate("");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: AcademicYear) => {
    setEditingItem(item);
    setName(item.name);
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

  const showNotification = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Nama tahun ajaran wajib diisi.");
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
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          data: {
            name: name.trim(),
            startDate,
            endDate,
          },
        });
        showNotification("success", `Tahun ajaran "${name}" berhasil diperbarui.`);
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          startDate,
          endDate,
          isActive: false,
        });
        showNotification("success", `Tahun ajaran "${name}" berhasil ditambahkan.`);
      }
      handleCloseModal();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal menyimpan data tahun ajaran.");
    }
  };

  const handleActivate = async (id: string, name: string) => {
    try {
      await activateMutation.mutateAsync({ id, isActive: true });
      showNotification("success", `Tahun ajaran "${name}" sekarang aktif.`);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      showNotification("error", apiErr?.message || "Gagal mengaktifkan tahun ajaran.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showNotification("success", `Tahun ajaran "${deleteTarget.name}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      showNotification("error", apiErr?.message || "Gagal menghapus tahun ajaran.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tahun Ajaran</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {academicYears.length} Data
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kelola kalender dan periode akademik resmi madrasah
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          size="sm"
          className="gap-1.5 shadow-sm rounded-xl px-4 py-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tahun Ajaran</span>
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
            placeholder="Cari tahun ajaran (contoh: 2024)..."
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
            <span>Memuat data tahun ajaran...</span>
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
              <p className="text-sm font-semibold text-slate-700">Belum Ada Tahun Ajaran</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {searchTerm
                  ? "Tidak ada data yang sesuai dengan pencarian Anda."
                  : "Mulai dengan menambahkan tahun ajaran baru untuk madrasah."}
              </p>
            </div>
            {!searchTerm && (
              <Button onClick={handleOpenCreateModal} size="sm" variant="outline" className="mt-2 rounded-xl text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Tambah Sekarang
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Tahun Ajaran</th>
                  <th className="py-3 px-4">Tanggal Mulai</th>
                  <th className="py-3 px-4">Tanggal Selesai</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
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
                            onClick={() => handleActivate(item.id, item.name)}
                            isLoading={
                              activateMutation.isPending &&
                              activateMutation.variables?.id === item.id
                            }
                            className="rounded-lg h-7 px-2 text-[11px] hover:border-emerald-400 hover:text-emerald-700"
                            title="Aktifkan tahun ajaran ini"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Aktifkan
                          </Button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit Tahun Ajaran"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          title="Hapus Tahun Ajaran"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Tambah / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran Baru"}
        description={
          editingItem
            ? "Perbarui periode kalender akademik yang telah terdaftar"
            : "Masukkan informasi periode akademik baru untuk madrasah"
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
              Nama Tahun Ajaran <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              placeholder="Contoh: 2026/2027"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            />
            <p className="text-[11px] text-slate-400 mt-1">Format umum: YYYY/YYYY (misal: 2024/2025)</p>
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
              {editingItem ? "Simpan Perubahan" : "Tambah Tahun Ajaran"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Tahun Ajaran"
        message={`Apakah Anda yakin ingin menghapus tahun ajaran "${deleteTarget?.name}"? Data yang terkait dengan tahun ajaran ini mungkin akan terpengaruh.`}
        confirmText="Hapus Tahun Ajaran"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
};
