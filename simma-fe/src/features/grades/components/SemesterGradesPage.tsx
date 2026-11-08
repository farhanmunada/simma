import React, { useState } from "react";
import { Calculator, Edit3, CheckCircle2, AlertCircle } from "lucide-react";
import {
  useSemesterGrades,
  useCalculateSemesterGrades,
  useUpsertSemesterGrade,
  useClassroomsReference,
  useSubjectsReference,
  useSemestersReference,
  useStudentsByClass,
} from "../api/grades.api";
import type {
  SemesterGrade,
  LetterGrade,
  SemesterGradeQueryParams,
  CreateSemesterGradeDto,
} from "../types";
import {
  calculateLetterGrade,
  getLetterGradeBadgeClass,
} from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

export const SemesterGradesPage: React.FC = () => {
  const { data: classrooms = [] } = useClassroomsReference();
  const { data: subjects = [] } = useSubjectsReference();
  const { data: semesters = [] } = useSemestersReference();

  // Selected filters
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");

  const queryParams: SemesterGradeQueryParams = {
    classroomId: selectedClassroomId || undefined,
    subjectId: selectedSubjectId || undefined,
    semesterId: selectedSemesterId || undefined,
    limit: 100,
  };

  const { data: semesterGradesData, isLoading, isError, error, refetch } = useSemesterGrades(queryParams);
  const semesterGrades = semesterGradesData?.data || [];

  const { data: classStudents = [] } = useStudentsByClass(selectedClassroomId || undefined);

  const calculateMutation = useCalculateSemesterGrades();
  const upsertMutation = useUpsertSemesterGrade();

  // Notification banners
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<{
    studentId: string;
    studentName: string;
    finalScore: number;
    letterGrade: LetterGrade;
  } | null>(null);
  const [editScoreInput, setEditScoreInput] = useState<number>(0);
  const [editLetterInput, setEditLetterInput] = useState<LetterGrade>("B");

  const handleCalculate = async () => {
    if (!selectedClassroomId || !selectedSubjectId || !selectedSemesterId) {
      setErrorMessage("Silakan pilih Kelas, Mata Pelajaran, dan Semester terlebih dahulu.");
      return;
    }
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await calculateMutation.mutateAsync({
        classroomId: selectedClassroomId,
        subjectId: selectedSubjectId,
        semesterId: selectedSemesterId,
      });

      setSuccessMessage(
        `Kalkulasi otomatis selesai: ${res.calculatedCount} nilai akhir siswa berhasil dihitung dan disimpan.`
      );
      refetch();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErrorMessage(e.message || "Gagal mengkalkulasi nilai semester otomatis.");
    }
  };

  const openManualEditModal = (grade: SemesterGrade) => {
    const student = classStudents.find((s) => s.id === grade.studentId);
    const studentName = grade.student?.fullName || student?.fullName || student?.name || "Siswa";

    setEditingGrade({
      studentId: grade.studentId,
      studentName,
      finalScore: grade.finalScore,
      letterGrade: grade.letterGrade,
    });
    setEditScoreInput(grade.finalScore);
    setEditLetterInput(grade.letterGrade);
    setIsEditModalOpen(true);
  };

  const handleSaveManualEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade || !selectedClassroomId || !selectedSubjectId || !selectedSemesterId) return;

    try {
      const payload: CreateSemesterGradeDto = {
        studentId: editingGrade.studentId,
        classroomId: selectedClassroomId,
        subjectId: selectedSubjectId,
        semesterId: selectedSemesterId,
        finalScore: Number(editScoreInput),
        letterGrade: editLetterInput,
      };

      await upsertMutation.mutateAsync(payload);
      setIsEditModalOpen(false);
      setSuccessMessage("Nilai akhir semester siswa berhasil diperbarui.");
      refetch();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert(e.message || "Gagal menyimpan perubahan nilai.");
    }
  };

  const getStudentInfo = (studentId: string) => {
    const student = classStudents.find((s) => s.id === studentId);
    return {
      name: student?.fullName || student?.name || "Siswa " + studentId.slice(0, 6),
      nisn: student?.nisn || "-",
      nis: student?.nis || "-",
    };
  };

  // Stats calculation
  const totalCount = semesterGrades.length;
  const averageFinalScore =
    totalCount > 0
      ? (semesterGrades.reduce((acc, g) => acc + g.finalScore, 0) / totalCount).toFixed(1)
      : "-";

  const countA = semesterGrades.filter((g) => g.letterGrade === "A").length;
  const countB = semesterGrades.filter((g) => g.letterGrade === "B").length;
  const countC = semesterGrades.filter((g) => g.letterGrade === "C").length;
  const countD = semesterGrades.filter((g) => g.letterGrade === "D").length;

  const isFilterComplete = Boolean(
    selectedClassroomId && selectedSubjectId && selectedSemesterId
  );

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 max-w-2xl">
            <Select
              name="filterClassroom"
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              options={[
                { value: "", label: "-- Pilih Kelas --" },
                ...classrooms.map((c) => ({ value: c.id, label: c.name || c.code || c.id })),
              ]}
            />
            <Select
              name="filterSubject"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              options={[
                { value: "", label: "-- Pilih Mapel --" },
                ...subjects.map((s) => ({ value: s.id, label: s.name || s.code || s.id })),
              ]}
            />
            <Select
              name="filterSemester"
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              options={[
                { value: "", label: "-- Pilih Semester --" },
                ...semesters.map((s) => ({ value: s.id, label: s.name || s.code || s.id })),
              ]}
            />
          </div>

          <Button
            onClick={handleCalculate}
            disabled={!isFilterComplete || calculateMutation.isPending}
            isLoading={calculateMutation.isPending}
            className="shrink-0 flex items-center gap-1.5"
          >
            <Calculator className="w-4 h-4" />
            <span>Hitung Nilai Semester Otomatis</span>
          </Button>
        </div>
      </Card>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Stats Summary Cards */}
      {isFilterComplete && totalCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium">Total Siswa</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{totalCount}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium">Rata-rata Akhir</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5 font-mono">{averageFinalScore}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium">Predikat A</p>
            <p className="text-lg font-bold text-emerald-600 mt-0.5 font-mono">{countA}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium">Predikat B</p>
            <p className="text-lg font-bold text-sky-600 mt-0.5 font-mono">{countB}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium">Predikat C</p>
            <p className="text-lg font-bold text-amber-600 mt-0.5 font-mono">{countC}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium">Predikat D</p>
            <p className="text-lg font-bold text-rose-600 mt-0.5 font-mono">{countD}</p>
          </div>
        </div>
      )}

      {/* Semester Grades Table */}
      <Card>
        {!isFilterComplete ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            Silakan pilih <strong>Kelas</strong>, <strong>Mata Pelajaran</strong>, dan <strong>Semester</strong> di filter atas untuk menampilkan rekap nilai akhir.
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Memuat data nilai akhir semester...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600 text-sm">
            Terjadi kesalahan: {(error as Error)?.message || "Gagal memuat nilai"}
          </div>
        ) : semesterGrades.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm space-y-2">
            <p>Belum ada nilai akhir semester yang tersimpan atau dikalkulasi untuk pilihan ini.</p>
            <p className="text-xs text-slate-400">
              Klik tombol <strong>Hitung Nilai Semester Otomatis</strong> untuk mengagregasi nilai dari seluruh rencana penilaian.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="py-2.5 px-3 font-semibold w-12 text-center">No</th>
                  <th className="py-2.5 px-3 font-semibold">Nama Siswa</th>
                  <th className="py-2.5 px-3 font-semibold w-32">NISN / NIS</th>
                  <th className="py-2.5 px-3 font-semibold w-32 text-center">Nilai Akhir</th>
                  <th className="py-2.5 px-3 font-semibold w-28 text-center">Predikat</th>
                  <th className="py-2.5 px-3 font-semibold text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {semesterGrades.map((grade, index) => {
                  const student = getStudentInfo(grade.studentId);
                  const studentName = grade.student?.fullName || student.name;
                  const nisn = grade.student?.nisn || student.nisn;

                  return (
                    <tr key={grade.id || grade.studentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900">{studentName}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                        {nisn}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {grade.finalScore}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded border ${getLetterGradeBadgeClass(
                            grade.letterGrade
                          )}`}
                        >
                          {grade.letterGrade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => openManualEditModal(grade)}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-700 text-xs font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                          title="Koreksi Nilai Manual"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Koreksi</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Manual Correction Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Koreksi Nilai Akhir Semester"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveManualEdit} className="space-y-4">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs space-y-1">
            <p className="text-slate-500">Nama Siswa:</p>
            <p className="font-bold text-slate-800 text-sm">{editingGrade?.studentName}</p>
          </div>

          <Input
            label="Nilai Akhir (0 - 100)"
            type="number"
            min={0}
            max={100}
            step="any"
            value={editScoreInput}
            onChange={(e) => {
              const val = Number(e.target.value);
              setEditScoreInput(val);
              setEditLetterInput(calculateLetterGrade(val));
            }}
            required
          />

          <Select
            label="Predikat Huruf"
            value={editLetterInput}
            onChange={(e) => setEditLetterInput(e.target.value as LetterGrade)}
            options={[
              { value: "A", label: "A (Sangat Baik / >= 85)" },
              { value: "B", label: "B (Baik / >= 75)" },
              { value: "C", label: "C (Cukup / >= 60)" },
              { value: "D", label: "D (Kurang / < 60)" },
            ]}
            required
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={upsertMutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={upsertMutation.isPending}>
              Simpan Koreksi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
