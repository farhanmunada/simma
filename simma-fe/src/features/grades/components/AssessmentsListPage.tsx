import React, { useState } from "react";
import { Link } from "react-router";
import { Plus, Trash2, Edit3, FileEdit, CheckCircle2 } from "lucide-react";
import {
  useAssessments,
  useCreateAssessment,
  useUpdateAssessment,
  useDeleteAssessment,
  useClassroomsReference,
  useSubjectsReference,
  useSemestersReference,
  useAcademicYearsReference,
} from "../api/grades.api";
import type {
  Assessment,
  GradeAssessmentType,
  AssessmentQueryParams,
  CreateAssessmentDto,
} from "../types";
import {
  ASSESSMENT_TYPE_OPTIONS,
  formatAssessmentTypeLabel,
} from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

export const AssessmentsListPage: React.FC = () => {
  // Filter states
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  // Queries
  const { data: classrooms = [] } = useClassroomsReference();
  const { data: subjects = [] } = useSubjectsReference();
  const { data: semesters = [] } = useSemestersReference();
  const { data: academicYears = [] } = useAcademicYearsReference();

  const queryParams: AssessmentQueryParams = {
    classroomId: selectedClassroomId || undefined,
    subjectId: selectedSubjectId || undefined,
    type: selectedType ? (selectedType as GradeAssessmentType) : undefined,
    limit: 50,
  };

  const { data: assessmentsData, isLoading, isError, error } = useAssessments(queryParams);
  const assessments = assessmentsData?.data || [];

  const createMutation = useCreateAssessment();
  const updateMutation = useUpdateAssessment();
  const deleteMutation = useDeleteAssessment();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<GradeAssessmentType>("harian");
  const [formClassroomId, setFormClassroomId] = useState("");
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formAcademicYearId, setFormAcademicYearId] = useState("");
  const [formSemesterId, setFormSemesterId] = useState("");
  const [formMaxScore, setFormMaxScore] = useState(100);
  const [formWeight, setFormWeight] = useState(1);

  // Delete Confirm State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingAssessment(null);
    setFormTitle("");
    setFormType("harian");
    setFormClassroomId(selectedClassroomId || classrooms[0]?.id || "");
    setFormSubjectId(selectedSubjectId || subjects[0]?.id || "");
    setFormAcademicYearId(academicYears[0]?.id || "");
    setFormSemesterId(semesters[0]?.id || "");
    setFormMaxScore(100);
    setFormWeight(1);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setFormTitle(assessment.title);
    setFormType(assessment.type);
    setFormClassroomId(assessment.classroomId);
    setFormSubjectId(assessment.subjectId);
    setFormAcademicYearId(assessment.academicYearId);
    setFormSemesterId(assessment.semesterId);
    setFormMaxScore(assessment.maxScore);
    setFormWeight(assessment.weight);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError("Judul rencana penilaian wajib diisi.");
      return;
    }
    if (!formClassroomId) {
      setFormError("Kelas wajib dipilih.");
      return;
    }
    if (!formSubjectId) {
      setFormError("Mata pelajaran wajib dipilih.");
      return;
    }
    if (!formAcademicYearId) {
      setFormError("Tahun ajaran wajib dipilih.");
      return;
    }
    if (!formSemesterId) {
      setFormError("Semester wajib dipilih.");
      return;
    }

    try {
      if (editingAssessment) {
        await updateMutation.mutateAsync({
          id: editingAssessment.id,
          data: {
            title: formTitle.trim(),
            type: formType,
            classroomId: formClassroomId,
            subjectId: formSubjectId,
            academicYearId: formAcademicYearId,
            semesterId: formSemesterId,
            maxScore: Number(formMaxScore),
            weight: Number(formWeight),
          },
        });
      } else {
        const payload: CreateAssessmentDto = {
          title: formTitle.trim(),
          type: formType,
          classroomId: formClassroomId,
          subjectId: formSubjectId,
          academicYearId: formAcademicYearId,
          semesterId: formSemesterId,
          maxScore: Number(formMaxScore),
          weight: Number(formWeight),
        };
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFormError(e.message || "Gagal menyimpan rencana penilaian.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteTargetId(null);
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert(e.message || "Gagal menghapus penilaian. Mungkin sudah ada nilai siswa terdaftar.");
    }
  };

  const getClassName = (id: string) =>
    classrooms.find((c) => c.id === id)?.name || classrooms.find((c) => c.id === id)?.code || id;

  const getSubjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name || subjects.find((s) => s.id === id)?.code || id;

  return (
    <div className="space-y-4">
      {/* Filter & Action Toolbar */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 max-w-2xl">
            <Select
              name="filterClassroom"
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              options={[
                { value: "", label: "-- Semua Kelas --" },
                ...classrooms.map((c) => ({ value: c.id, label: c.name || c.code || c.id })),
              ]}
            />
            <Select
              name="filterSubject"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              options={[
                { value: "", label: "-- Semua Mapel --" },
                ...subjects.map((s) => ({ value: s.id, label: s.name || s.code || s.id })),
              ]}
            />
            <Select
              name="filterType"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={[
                { value: "", label: "-- Semua Tipe --" },
                ...ASSESSMENT_TYPE_OPTIONS,
              ]}
            />
          </div>

          <Button onClick={openCreateModal} className="shrink-0 flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Tambah Rencana Penilaian</span>
          </Button>
        </div>
      </Card>

      {/* Assessment Table */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Memuat daftar penilaian...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600 text-sm">
            Terjadi kesalahan: {(error as Error)?.message || "Gagal memuat data"}
          </div>
        ) : assessments.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            Belum ada rencana penilaian yang dibuat. Silakan tambahkan rencana penilaian baru.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="py-2.5 px-3 font-semibold">Tipe</th>
                  <th className="py-2.5 px-3 font-semibold">Judul Penilaian</th>
                  <th className="py-2.5 px-3 font-semibold">Kelas</th>
                  <th className="py-2.5 px-3 font-semibold">Mata Pelajaran</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Skor Maks</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Bobot</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {assessments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3">
                      <Badge variant="info">{formatAssessmentTypeLabel(item.type)}</Badge>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{item.title}</td>
                    <td className="py-2.5 px-3 text-slate-600">{getClassName(item.classroomId)}</td>
                    <td className="py-2.5 px-3 text-slate-600">{getSubjectName(item.subjectId)}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{item.maxScore}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{item.weight}x</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link to={`/grades/assessments/${item.id}/input`}>
                          <Button size="sm" variant="primary" className="h-7 px-2.5 text-xs flex items-center gap-1">
                            <FileEdit className="w-3.5 h-3.5" />
                            <span>Input Nilai</span>
                          </Button>
                        </Link>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded transition-colors"
                          title="Ubah Rencana"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(item.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded transition-colors"
                          title="Hapus"
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

      {/* Modal Form Tambah / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssessment ? "Ubah Rencana Penilaian" : "Tambah Rencana Penilaian"}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAssessment} className="space-y-3">
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
              onClick={() => setIsModalOpen(false)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingAssessment ? "Simpan Perubahan" : "Buat Penilaian"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        title="Konfirmasi Hapus Penilaian"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Apakah Anda yakin ingin menghapus rencana penilaian ini? Tindakan ini tidak dapat
            dibatalkan jika sudah memiliki nilai siswa.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTargetId(null)}
              disabled={deleteMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteTargetId && handleDelete(deleteTargetId)}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
