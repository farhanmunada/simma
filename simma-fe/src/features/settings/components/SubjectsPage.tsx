import React, { useState, useMemo } from "react";
import {
  Plus,
  AlertCircle,
  BookOpen,
  Pencil,
  Trash2,
  Search,
  Sparkles,
} from "lucide-react";
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from "../api/settings.api";
import type { Subject } from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";

const SUBJECT_GROUPS = [
  { value: "A", label: "Kelompok A (PAI & Bahasa Arab)" },
  { value: "B", label: "Kelompok B (Umum)" },
  { value: "Pilihan", label: "Kelompok Pilihan (Peminatan)" },
  { value: "Mulok", label: "Muatan Lokal" },
];

export const SubjectsPage: React.FC = () => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedPhase, setSelectedPhase] = useState<string>("");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [group, setGroup] = useState("Pendidikan Agama Islam");
  const [phase, setPhase] = useState<"E" | "F">("E");
  const [jpPerWeek, setJpPerWeek] = useState<number>(2);
  const [isRequired, setIsRequired] = useState<string>("true");

  const queryParams = useMemo(() => {
    return {
      ...(selectedPhase ? { phase: selectedPhase as "E" | "F" } : {}),
    };
  }, [selectedPhase]);

  const { data: subjectsRaw = [], isLoading, isError, error } = useSubjects(queryParams);
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const deleteMutation = useDeleteSubject();

  // Filter by group, phase, and search
  const filteredSubjects = useMemo(() => {
    return subjectsRaw.filter((s) => {
      const g = s.group.toLowerCase();
      const selG = selectedGroup.toLowerCase();
      const matchGroup =
        !selectedGroup ||
        g === selG ||
        (selG === "a" && (g === "a" || g.includes("agama") || g.includes("pai"))) ||
        (selG === "b" && (g === "b" || g.includes("umum"))) ||
        (selG === "pilihan" && (g === "pilihan" || g.includes("peminatan"))) ||
        (selG === "mulok" && (g === "mulok" || g.includes("lokal")));

      const matchPhase = !selectedPhase || s.phase === selectedPhase;
      const matchSearch =
        !searchTerm.trim() ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase());
      return matchGroup && matchPhase && matchSearch;
    });
  }, [subjectsRaw, selectedGroup, selectedPhase, searchTerm]);

  const showNotification = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setCode("");
    setName("");
    setGroup("A");
    setPhase("E");
    setJpPerWeek(2);
    setIsRequired("true");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Subject) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setGroup(item.group);
    setPhase(item.phase);
    setJpPerWeek(item.jpPerWeek);
    setIsRequired(item.isRequired ? "true" : "false");
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

    if (!code.trim() || !name.trim()) {
      setFormError("Kode dan nama mata pelajaran wajib diisi.");
      return;
    }

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          data: {
            code: code.trim().toUpperCase(),
            name: name.trim(),
            group,
            phase,
            jpPerWeek: Number(jpPerWeek) || 2,
            isRequired: isRequired === "true",
          },
        });
        showNotification("success", `Mata pelajaran "${name}" berhasil diperbarui.`);
      } else {
        await createMutation.mutateAsync({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          group,
          phase,
          jpPerWeek: Number(jpPerWeek) || 2,
          isRequired: isRequired === "true",
        });
        showNotification("success", `Mata pelajaran "${name}" berhasil ditambahkan.`);
      }
      handleCloseModal();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal menyimpan mata pelajaran.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showNotification("success", `Mata pelajaran "${deleteTarget.name}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      showNotification("error", apiErr?.message || "Gagal menghapus mata pelajaran.");
    }
  };

  const getGroupBadge = (grp: string) => {
    const g = grp.toLowerCase();
    if (g === "a" || g.includes("agama") || g.includes("pai")) {
      return (
        <Badge variant="success" size="sm" className="font-medium">
          Kelompok A (PAI)
        </Badge>
      );
    }
    if (g === "pilihan" || g.includes("peminatan") || g.includes("c")) {
      return (
        <Badge variant="warning" size="sm" className="font-medium">
          Kelompok Pilihan
        </Badge>
      );
    }
    if (g === "mulok" || g.includes("lokal")) {
      return (
        <Badge variant="neutral" size="sm" className="font-medium">
          Muatan Lokal
        </Badge>
      );
    }
    return (
      <Badge variant="info" size="sm" className="font-medium">
        Kelompok B (Umum)
      </Badge>
    );
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mata Pelajaran</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {subjectsRaw.length} Mapel
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kelola kurikulum, beban JP, dan rumpun mapel PAI Kemenag serta Umum
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          size="sm"
          className="gap-1.5 shadow-sm rounded-xl px-4 py-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mata Pelajaran</span>
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
            placeholder="Cari nama atau kode mapel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-xs"
          />
        </div>

        <div className="w-56">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-xs"
          >
            <option value="">Semua Kelompok Mapel</option>
            {SUBJECT_GROUPS.map((grp) => (
              <option key={grp.value} value={grp.value}>
                {grp.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-44">
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-xs"
          >
            <option value="">Semua Fase</option>
            <option value="E">Fase E (Kelas 10)</option>
            <option value="F">Fase F (Kelas 11-12)</option>
          </select>
        </div>

        {(selectedGroup || selectedPhase || searchTerm) && (
          <button
            onClick={() => {
              setSelectedGroup("");
              setSelectedPhase("");
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
            <span>Memuat data mata pelajaran...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-600 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{(error as Error)?.message || "Gagal memuat data."}</span>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Belum Ada Mata Pelajaran</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {searchTerm || selectedGroup || selectedPhase
                  ? "Tidak ada mata pelajaran yang cocok dengan filter pencarian."
                  : "Mulai dengan menambahkan mata pelajaran kurikulum madrasah."}
              </p>
            </div>
            {!searchTerm && !selectedGroup && !selectedPhase && (
              <Button onClick={handleOpenCreateModal} size="sm" variant="outline" className="mt-2 rounded-xl text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Tambah Mapel
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-28">Kode</th>
                  <th className="py-3 px-4">Nama Mata Pelajaran</th>
                  <th className="py-3 px-4">Kelompok</th>
                  <th className="py-3 px-4 text-center">Fase</th>
                  <th className="py-3 px-4 text-center">Beban (JP)</th>
                  <th className="py-3 px-4 text-center">Sifat</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubjects.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-700 text-xs">
                      {item.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getGroupBadge(item.group)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        Fase {item.phase}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">
                      {item.jpPerWeek} JP/mgg
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.isRequired ? (
                        <Badge variant="neutral" size="sm" className="font-medium">
                          Wajib
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm" className="font-medium">
                          Pilihan
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit Mata Pelajaran"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          title="Hapus Mata Pelajaran"
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
        title={editingItem ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran Baru"}
        description={
          editingItem
            ? "Perbarui informasi kurikulum, kode, atau beban jam pelajaran"
            : "Masukkan detail mata pelajaran baru untuk kurikulum madrasah"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {formError && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kode Mapel <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Contoh: QUR-10"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors uppercase font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Mata Pelajaran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Al-Qur'an Hadis"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kelompok Mata Pelajaran <span className="text-rose-500">*</span>
            </label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            >
              {SUBJECT_GROUPS.map((grp) => (
                <option key={grp.value} value={grp.value}>
                  {grp.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fase Kurikulum <span className="text-rose-500">*</span>
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as "E" | "F")}
                required
                className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              >
                <option value="E">Fase E (Kelas 10)</option>
                <option value="F">Fase F (Kelas 11-12)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Beban Belajar (JP) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={jpPerWeek}
                onChange={(e) => setJpPerWeek(Number(e.target.value))}
                required
                className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sifat Mapel <span className="text-rose-500">*</span>
              </label>
              <select
                value={isRequired}
                onChange={(e) => setIsRequired(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 text-xs px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              >
                <option value="true">Wajib</option>
                <option value="false">Pilihan</option>
              </select>
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
              {editingItem ? "Simpan Perubahan" : "Tambah Mapel"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Mata Pelajaran"
        message={`Apakah Anda yakin ingin menghapus mata pelajaran "${deleteTarget?.name}" (${deleteTarget?.code})? Data penilaian yang menggunakan mapel ini dapat terpengaruh.`}
        confirmText="Hapus Mapel"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
};
