import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { P5RA_THEMES, P5RA_FASES } from "@simma/shared";
import { useAcademicYears, useSemesters, useClassrooms } from "../../settings";
import type { P5raProjectItem } from "../types";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    academicYearId: string;
    semesterId: string;
    title: string;
    theme: string;
    description: string;
    targetFase: string;
    classroomIds: string[];
    startDate?: string;
    endDate?: string;
  }) => void;
  isLoading?: boolean;
  initialData?: P5raProjectItem | null;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}) => {
  const { data: academicYears = [] } = useAcademicYears();
  const [academicYearId, setAcademicYearId] = useState("");
  const { data: semesters = [] } = useSemesters(academicYearId ? { academicYearId } : undefined);
  const [semesterId, setSemesterId] = useState("");
  const { data: classrooms = [] } = useClassrooms(semesterId ? { semesterId } : undefined);

  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState<string>(P5RA_THEMES[0]);
  const [targetFase, setTargetFase] = useState<string>("E");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClassroomIds, setSelectedClassroomIds] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setTheme(initialData.theme);
      setTargetFase(initialData.targetFase);
      setDescription(initialData.description);
      setAcademicYearId(initialData.academicYearId);
      setSemesterId(initialData.semesterId);
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
    } else {
      const activeAy = academicYears.find((y) => y.isActive) || academicYears[0];
      if (activeAy) setAcademicYearId(activeAy.id);
      setTitle("");
      setTheme(P5RA_THEMES[0]);
      setTargetFase("E");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setSelectedClassroomIds([]);
    }
  }, [initialData, academicYears, isOpen]);

  useEffect(() => {
    if (!initialData && semesters.length > 0 && !semesterId) {
      const activeSem = semesters.find((s) => s.isActive) || semesters[0];
      if (activeSem) setSemesterId(activeSem.id);
    }
  }, [semesters, semesterId, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !academicYearId || !semesterId) return;

    onSubmit({
      academicYearId,
      semesterId,
      title: title.trim(),
      theme,
      targetFase,
      description: description.trim(),
      classroomIds: selectedClassroomIds,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const toggleClassroom = (id: string) => {
    setSelectedClassroomIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Ubah Projek P5RA" : "Buat Projek P5RA Baru"}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Judul Projek <span className="text-red-500">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Pengolahan Sampah Organik Menjadi Kompos"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tahun Ajaran <span className="text-red-500">*</span>
            </label>
            <Select
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              options={[
                { label: "Pilih Tahun Ajaran", value: "" },
                ...academicYears.map((ay) => ({ label: ay.name, value: ay.id })),
              ]}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Semester <span className="text-red-500">*</span>
            </label>
            <Select
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              options={[
                { label: "Pilih Semester", value: "" },
                ...semesters.map((s) => ({
                  label: `Semester ${s.type === 1 ? "Ganjil" : "Genap"}`,
                  value: s.id,
                })),
              ]}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tema Kemenag <span className="text-red-500">*</span>
            </label>
            <Select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              options={P5RA_THEMES.map((t) => ({ label: t, value: t }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Fase Kurikulum <span className="text-red-500">*</span>
            </label>
            <Select
              value={targetFase}
              onChange={(e) => setTargetFase(e.target.value)}
              options={P5RA_FASES.map((f) => ({
                label: `Fase ${f} (${f === "E" ? "Kelas X" : "Kelas XI-XII"})`,
                value: f,
              }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Tanggal Mulai</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Tanggal Selesai</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Deskripsi Singkat Projek <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 p-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Jelaskan tujuan, ruang lingkup, dan konteks projek..."
            required
          />
        </div>

        {!initialData && classrooms.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Alokasikan ke Rombongan Belajar (Rombel)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-md bg-slate-50">
              {classrooms.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedClassroomIds.includes(c.id)}
                    onChange={() => toggleClassroom(c.id)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? "Simpan Perubahan" : "Buat Projek"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
