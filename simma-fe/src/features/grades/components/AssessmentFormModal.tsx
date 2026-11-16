import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { ASSESSMENT_TYPE_OPTIONS } from "../utils/grade-helpers";
import type { Assessment, CreateAssessmentDto, GradeAssessmentType } from "../types";
import type { ReferenceItem } from "../hooks/useGradesReferences";

interface AssessmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAssessment: Assessment | null;
  classrooms: ReferenceItem[];
  subjects: ReferenceItem[];
  semesters: ReferenceItem[];
  academicYears: ReferenceItem[];
  onSubmit: (data: CreateAssessmentDto) => Promise<void>;
  isLoading: boolean;
}

export const AssessmentFormModal: React.FC<AssessmentFormModalProps> = ({
  isOpen,
  onClose,
  editingAssessment,
  classrooms,
  subjects,
  semesters,
  academicYears,
  onSubmit,
  isLoading,
}) => {
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<GradeAssessmentType>("harian");
  const [formClassroomId, setFormClassroomId] = useState("");
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formSemesterId, setFormSemesterId] = useState("");
  const [formAcademicYearId, setFormAcademicYearId] = useState("");
  const [formMaxScore, setFormMaxScore] = useState<number>(100);
  const [formWeight, setFormWeight] = useState<number>(1);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (editingAssessment) {
      setFormTitle(editingAssessment.title);
      setFormType(editingAssessment.type);
      setFormClassroomId(editingAssessment.classroomId);
      setFormSubjectId(editingAssessment.subjectId);
      setFormSemesterId(editingAssessment.semesterId);
      setFormAcademicYearId(editingAssessment.academicYearId);
      setFormMaxScore(editingAssessment.maxScore || 100);
      setFormWeight(editingAssessment.weight || 1);
    } else {
      setFormTitle("");
      setFormType("harian");
      setFormClassroomId(classrooms[0]?.id || "");
      setFormSubjectId(subjects[0]?.id || "");
      setFormSemesterId(semesters[0]?.id || "");
      setFormAcademicYearId(academicYears[0]?.id || "");
      setFormMaxScore(100);
      setFormWeight(1);
    }
    setFormError(null);
  }, [editingAssessment, isOpen, classrooms, subjects, semesters, academicYears]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Judul penilaian harus diisi");
      return;
    }
    if (!formClassroomId || !formSubjectId || !formSemesterId || !formAcademicYearId) {
      setFormError("Kelas, Mapel, Semester, dan Tahun Ajaran wajib dipilih");
      return;
    }

    try {
      await onSubmit({
        title: formTitle.trim(),
        type: formType,
        classroomId: formClassroomId,
        subjectId: formSubjectId,
        semesterId: formSemesterId,
        academicYearId: formAcademicYearId,
        maxScore: Number(formMaxScore),
        weight: Number(formWeight),
      });
      onClose();
    } catch (err: unknown) {
      setFormError((err as Error)?.message || "Gagal menyimpan penilaian");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingAssessment ? "Ubah Rencana Penilaian" : "Tambah Rencana Penilaian"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {formError && (
          <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {formError}
          </div>
        )}

        <Input
          label="Judul Penilaian"
          placeholder="Contoh: Formatif Bab 1: Eksponen & Logaritma"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Tipe Penilaian"
            value={formType}
            onChange={(e) => setFormType(e.target.value as GradeAssessmentType)}
            options={ASSESSMENT_TYPE_OPTIONS}
          />

          <Select
            label="Kelas"
            value={formClassroomId}
            onChange={(e) => setFormClassroomId(e.target.value)}
            options={[
              { value: "", label: "-- Pilih Kelas --" },
              ...classrooms.map((c) => ({ value: c.id, label: c.name || c.code || c.id })),
            ]}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Mata Pelajaran"
            value={formSubjectId}
            onChange={(e) => setFormSubjectId(e.target.value)}
            options={[
              { value: "", label: "-- Pilih Mata Pelajaran --" },
              ...subjects.map((s) => ({ value: s.id, label: s.name || s.code || s.id })),
            ]}
            required
          />

          <Select
            label="Semester"
            value={formSemesterId}
            onChange={(e) => setFormSemesterId(e.target.value)}
            options={[
              { value: "", label: "-- Pilih Semester --" },
              ...semesters.map((s) => ({ value: s.id, label: s.name || s.code || s.id })),
            ]}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Tahun Ajaran"
            value={formAcademicYearId}
            onChange={(e) => setFormAcademicYearId(e.target.value)}
            options={[
              { value: "", label: "-- Pilih Tahun Ajaran --" },
              ...academicYears.map((a) => ({ value: a.id, label: a.name || a.code || a.id })),
            ]}
            required
          />

          <Input
            label="Skor Maksimal"
            type="number"
            min={1}
            max={1000}
            value={formMaxScore}
            onChange={(e) => setFormMaxScore(Number(e.target.value))}
            required
          />

          <Input
            label="Bobot"
            type="number"
            min={0.1}
            step={0.1}
            value={formWeight}
            onChange={(e) => setFormWeight(Number(e.target.value))}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {editingAssessment ? "Simpan Perubahan" : "Buat Penilaian"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
