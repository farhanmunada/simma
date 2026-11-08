import React, { useState, useMemo } from "react";
import {
  Plus,
  AlertCircle,
  Users,
  Pencil,
  Trash2,
  Search,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import {
  useClassrooms,
  useSemesters,
  useTeachers,
  useCreateClassroom,
  useUpdateClassroom,
  useDeleteClassroom,
} from "../api/settings.api";
import type { Classroom } from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";

export const ClassroomsPage: React.FC = () => {
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Classroom | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Classroom | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [semesterId, setSemesterId] = useState("");
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState<number>(10);
  const [homeroomTeacherId, setHomeroomTeacherId] = useState<string>("");
  const [capacity, setCapacity] = useState<number>(36);

  const { data: semesters = [] } = useSemesters();
  const { data: teachers = [] } = useTeachers();

  const queryParams = useMemo(() => {
    return {
      ...(selectedGrade ? { gradeLevel: Number(selectedGrade) } : {}),
      ...(selectedSemester ? { semesterId: selectedSemester } : {}),
    };
  }, [selectedGrade, selectedSemester]);

  const { data: classrooms = [], isLoading, isError, error } = useClassrooms(queryParams);
  const createMutation = useCreateClassroom();
  const updateMutation = useUpdateClassroom();
  const deleteMutation = useDeleteClassroom();

  const teacherMap = useMemo(() => {
    const map = new Map<string, string>();
    teachers.forEach((t) => map.set(t.id, t.fullName));
    return map;
  }, [teachers]);

  const semesterMap = useMemo(() => {
    const map = new Map<string, string>();
    semesters.forEach((s) => {
      const typeStr = s.type === 1 ? "Ganjil" : "Genap";
      map.set(s.id, `Semester ${typeStr} (${s.startDate.slice(0, 4)})`);
    });
    return map;
  }, [semesters]);

  const filteredClassrooms = useMemo(() => {
    if (!searchTerm.trim()) return classrooms;
    const q = searchTerm.toLowerCase();
    return classrooms.filter((item) => {
      const teacherName = (teacherMap.get(item.homeroomTeacherId || "") || "").toLowerCase();
      return item.name.toLowerCase().includes(q) || teacherName.includes(q);
    });
  }, [classrooms, searchTerm, teacherMap]);

  const showNotification = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenCreateModal = () => {
    const activeSemester = semesters.find((s) => s.isActive)?.id || semesters[0]?.id || "";
    setEditingItem(null);
    setSemesterId(activeSemester);
    setName("");
    setGradeLevel(10);
    setHomeroomTeacherId("");
    setCapacity(36);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Classroom) => {
    setEditingItem(item);
    setSemesterId(item.semesterId);
    setName(item.name);
    setGradeLevel(item.gradeLevel);
    setHomeroomTeacherId(item.homeroomTeacherId || "");
    setCapacity(item.capacity || 36);
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

    if (!semesterId) {
      setFormError("Semester wajib dipilih.");
      return;
    }
    if (!name.trim()) {
      setFormError("Nama kelas/rombel wajib diisi.");
      return;
    }

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          data: {
            semesterId,
            name: name.trim(),
            gradeLevel: Number(gradeLevel),
            homeroomTeacherId: homeroomTeacherId || null,
            capacity: Number(capacity) || 36,
          },
        });
        showNotification("success", `Rombel "${name}" berhasil diperbarui.`);
      } else {
        await createMutation.mutateAsync({
          semesterId,
          name: name.trim(),
          gradeLevel: Number(gradeLevel),
          homeroomTeacherId: homeroomTeacherId || null,
          capacity: Number(capacity) || 36,
        });
        showNotification("success", `Rombel "${name}" berhasil ditambahkan.`);
      }
      handleCloseModal();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal menyimpan rombel kelas.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showNotification("success", `Rombel "${deleteTarget.name}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      showNotification("error", apiErr?.message || "Gagal menghapus rombel kelas.");
    }
  };

  const gradeBadgeVariant = (grade: number): "info" | "neutral" | "warning" => {
    if (grade === 10) return "info";
    if (grade === 11) return "warning";
    return "neutral";
  };

  const gradeDisplay = (grade: number) => {
    if (grade === 10) return "Tingkat X";
    if (grade === 11) return "Tingkat XI";
    if (grade === 12) return "Tingkat XII";
    return `Tingkat ${grade}`;
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kelas & Rombel</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {classrooms.length} Rombel
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kelola rombongan belajar tingkat X, XI, XII dan penugasan wali kelas
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          size="sm"
          className="gap-1.5 shadow-sm rounded-xl px-4 py-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Rombel</span>
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

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kelas atau wali kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-xs"
          />
        </div>

        <div className="w-36">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-xs"
          >
            <option value="">Semua Tingkat</option>
            <option value="10">Tingkat X</option>
            <option value="11">Tingkat XI</option>
            <option value="12">Tingkat XII</option>
          </select>
        </div>

        <div className="w-48">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-xs"
          >
            <option value="">Semua Semester</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                Semester {s.type === 1 ? "Ganjil" : "Genap"} {s.isActive ? " (Aktif)" : ""}
              </option>
            ))}
          </select>
        </div>

        {(selectedGrade || selectedSemester || searchTerm) && (
          <button
            onClick={() => {
              setSelectedGrade("");
              setSelectedSemester("");
              setSearchTerm("");
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
            <span>Memuat data kelas & rombel...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-600 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{(error as Error)?.message || "Gagal memuat data."}</span>
          </div>
        ) : filteredClassrooms.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Belum Ada Rombel Kelas</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {searchTerm || selectedGrade || selectedSemester
                  ? "Tidak ada rombel yang cocok dengan filter atau kata kunci."
                  : "Mulai dengan membuat rombongan belajar baru untuk tahun ajaran aktif."}
              </p>
            </div>
            {!searchTerm && !selectedGrade && !selectedSemester && (
              <Button onClick={handleOpenCreateModal} size="sm" variant="outline" className="mt-2 rounded-xl text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Tambah Rombel
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Rombel / Kelas</th>
                  <th className="py-3 px-4">Tingkat</th>
                  <th className="py-3 px-4">Wali Kelas</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4 text-center">Kapasitas</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClassrooms.map((item, idx) => {
                  const teacherName = item.homeroomTeacherId
                    ? teacherMap.get(item.homeroomTeacherId) || "Wali Kelas Ditugaskan"
                    : "-";
                  const semesterLabel = semesterMap.get(item.semesterId) || "-";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant={gradeBadgeVariant(item.gradeLevel)} size="sm">
                          {gradeDisplay(item.gradeLevel)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{teacherName}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{semesterLabel}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                          <Users className="w-3 h-3 text-slate-400" />
                          {item.capacity} siswa
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Rombel"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            title="Hapus Rombel"
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
        title={editingItem ? "Edit Rombel Kelas" : "Tambah Rombel Kelas Baru"}
        description={
          editingItem
            ? "Perbarui informasi nama rombel, tingkat kelas, atau wali kelas"
            : "Buat rombongan belajar baru untuk penempatan siswa"
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
              Nama Kelas / Rombel <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              placeholder="Contoh: X Keagamaan 1, XI MIPA 2, XII IPS"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Semester <span className="text-rose-500">*</span>
            </label>
            <select
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            >
              {semesters.length > 0 ? (
                semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    Semester {s.type === 1 ? "Ganjil" : "Genap"} {s.isActive ? " (Aktif)" : ""}
                  </option>
                ))
              ) : (
                <option value="">Belum ada data semester</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tingkat Kelas <span className="text-rose-500">*</span>
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(Number(e.target.value))}
                required
                className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              >
                <option value={10}>Kelas 10 (Fase E)</option>
                <option value={11}>Kelas 11 (Fase F)</option>
                <option value={12}>Kelas 12 (Fase F)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kapasitas Siswa <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
                className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Wali Kelas (Opsional)
            </label>
            <select
              value={homeroomTeacherId}
              onChange={(e) => setHomeroomTeacherId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            >
              <option value="">-- Belum Ditentukan --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.employmentType})
                </option>
              ))}
            </select>
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
              {editingItem ? "Simpan Perubahan" : "Tambah Rombel"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Rombel Kelas"
        message={`Apakah Anda yakin ingin menghapus rombel "${deleteTarget?.name}"? Siswa di kelas ini tidak akan memiliki rombel aktif.`}
        confirmText="Hapus Rombel"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
};
