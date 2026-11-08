import React, { useState, useMemo } from "react";
import {
  Plus,
  AlertCircle,
  Award,
  UserCheck,
  Pencil,
  Trash2,
  Search,
  Sparkles,
} from "lucide-react";
import {
  useTeachers,
  useCreateTeacher,
  useUpdateTeacher,
  useDeleteTeacher,
} from "../api/settings.api";
import type { Teacher } from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";

export const TeachersPage: React.FC = () => {
  // Filters & Search
  const [selectedType, setSelectedType] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Teacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [nik, setNik] = useState("");
  const [nuptk, setNuptk] = useState("");
  const [fullName, setFullName] = useState("");
  const [employmentType, setEmploymentType] = useState<"PNS" | "PPPK" | "GTY" | "GTT">("GTY");
  const [certification, setCertification] = useState("");

  const queryParams = useMemo(() => {
    return {
      ...(selectedType ? { employmentType: selectedType as "PNS" | "PPPK" | "GTY" | "GTT" } : {}),
      ...(search ? { search } : {}),
    };
  }, [selectedType, search]);

  const { data: teachers = [], isLoading, isError, error } = useTeachers(queryParams);
  const createMutation = useCreateTeacher();
  const updateMutation = useUpdateTeacher();
  const deleteMutation = useDeleteTeacher();

  const showNotification = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setNik("");
    setNuptk("");
    setFullName("");
    setEmploymentType("GTY");
    setCertification("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Teacher) => {
    setEditingItem(item);
    setNik(item.nik);
    setNuptk(item.nuptk || "");
    setFullName(item.fullName);
    setEmploymentType(item.employmentType);
    setCertification(item.certification || "");
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

    const cleanNik = nik.trim();
    if (cleanNik.length !== 16 || !/^\d+$/.test(cleanNik)) {
      setFormError("NIK harus berupa 16 digit angka.");
      return;
    }
    if (!fullName.trim()) {
      setFormError("Nama lengkap guru wajib diisi.");
      return;
    }

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          data: {
            nik: cleanNik,
            nuptk: nuptk.trim() || undefined,
            fullName: fullName.trim(),
            employmentType,
            certification: certification.trim() || undefined,
          },
        });
        showNotification("success", `Data GTK "${fullName}" berhasil diperbarui.`);
      } else {
        await createMutation.mutateAsync({
          nik: cleanNik,
          nuptk: nuptk.trim() || undefined,
          fullName: fullName.trim(),
          employmentType,
          certification: certification.trim() || undefined,
        });
        showNotification("success", `Guru / GTK "${fullName}" berhasil ditambahkan.`);
      }
      handleCloseModal();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal menyimpan data guru.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showNotification("success", `Data GTK "${deleteTarget.fullName}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      showNotification("error", apiErr?.message || "Gagal menghapus data guru.");
    }
  };

  const getEmploymentBadgeVariant = (type: string): "info" | "success" | "warning" | "neutral" => {
    switch (type) {
      case "PNS":
        return "success";
      case "PPPK":
        return "info";
      case "GTY":
        return "neutral";
      default:
        return "warning";
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Guru & Tenaga Kependidikan</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {teachers.length} GTK
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kelola data profil, NUPTK, status kepegawaian (PNS, PPPK, GTY), dan sertifikasi pendidik
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          size="sm"
          className="gap-1.5 shadow-sm rounded-xl px-4 py-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah GTK</span>
        </Button>
      </div>

      {/* Feedback Toast */}
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

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIK, atau NUPTK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-xs"
          />
        </div>

        <div className="w-60">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-xs"
          >
            <option value="">Semua Status Kepegawaian</option>
            <option value="PNS">Pegawai Negeri Sipil (PNS)</option>
            <option value="PPPK">PPPK Kemenag</option>
            <option value="GTY">Guru Tetap Yayasan (GTY)</option>
            <option value="GTT">Guru Tidak Tetap (GTT)</option>
          </select>
        </div>

        {(selectedType || search) && (
          <button
            onClick={() => {
              setSelectedType("");
              setSearch("");
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Table Card */}
      <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span>Memuat data guru & tenaga kependidikan...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-600 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{(error as Error)?.message || "Gagal memuat data."}</span>
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Belum Ada Data GTK</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {search || selectedType
                  ? "Tidak ada guru atau GTK yang cocok dengan filter pencarian."
                  : "Mulai dengan mendaftarkan dewan guru atau tenaga kependidikan madrasah."}
              </p>
            </div>
            {!search && !selectedType && (
              <Button onClick={handleOpenCreateModal} size="sm" variant="outline" className="mt-2 rounded-xl text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Tambah GTK
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Lengkap & Gelar</th>
                  <th className="py-3 px-4">NIP / NUPTK</th>
                  <th className="py-3 px-4">NIK</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Sertifikasi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.fullName.charAt(0)}
                        </div>
                        <span className="text-slate-900">{item.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 text-xs">
                      {item.nuptk || <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-xs">{item.nik}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={getEmploymentBadgeVariant(item.employmentType)} size="sm">
                        {item.employmentType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-xs">
                      {item.certification ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                          <Award className="w-3 h-3 shrink-0" />
                          <span>{item.certification}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit Guru / GTK"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          title="Hapus Guru / GTK"
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

      {/* Modal Tambah / Edit GTK */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "Edit Data Guru / GTK" : "Tambah Guru / GTK Baru"}
        description={
          editingItem
            ? "Perbarui data kepegawaian, gelar, NIK, atau sertifikasi pendidik"
            : "Masukkan detail guru atau tenaga kependidikan baru madrasah"
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
              Nama Lengkap & Gelar <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Pd.I"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                NIK (16 Digit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="3201xxxxxxxxxxxx"
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                required
                className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                NIP / NUPTK (Opsional)
              </label>
              <input
                type="text"
                placeholder="19800101..."
                value={nuptk}
                onChange={(e) => setNuptk(e.target.value)}
                className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status Kepegawaian <span className="text-rose-500">*</span>
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as "PNS" | "PPPK" | "GTY" | "GTT")}
                required
                className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              >
                <option value="GTY">Guru Tetap Yayasan (GTY)</option>
                <option value="PNS">Pegawai Negeri Sipil (PNS)</option>
                <option value="PPPK">PPPK Kemenag</option>
                <option value="GTT">Guru Tidak Tetap (GTT)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sertifikasi Guru (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Pendidik Profesional Fikih"
                value={certification}
                onChange={(e) => setCertification(e.target.value)}
                className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
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
              {editingItem ? "Simpan Perubahan" : "Tambah GTK"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Guru / GTK"
        message={`Apakah Anda yakin ingin menghapus data guru "${deleteTarget?.fullName}"? Riwayat penugasan mengajar dan wali kelas guru ini akan ikut terhapus.`}
        confirmText="Hapus GTK"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
};
