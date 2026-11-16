import React, { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import {
  useSemesterGrades,
  useCalculateSemesterGrades,
  useUpsertSemesterGrade,
} from "../api/grades.api";
import {
  useClassroomsReference,
  useSubjectsReference,
  useSemestersReference,
  useStudentsByClass,
} from "../hooks/useGradesReferences";
import type {
  SemesterGrade,
  CreateSemesterGradeDto,
} from "../types";
import { SemesterGradesFilterBar } from "./SemesterGradesFilterBar";
import { SemesterStatsSummary } from "./SemesterStatsSummary";
import { SemesterGradesTable } from "./SemesterGradesTable";
import {
  ManualEditGradeModal,
  type EditingSemesterGradeItem,
} from "./ManualEditGradeModal";

export const SemesterGradesPage: React.FC = () => {
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");

  const { data: classrooms = [] } = useClassroomsReference();
  const { data: subjects = [] } = useSubjectsReference();
  const { data: semesters = [] } = useSemestersReference();
  const { data: students = [] } = useStudentsByClass(selectedClassroomId || undefined);

  const isFilterComplete = Boolean(
    selectedClassroomId && selectedSubjectId && selectedSemesterId
  );

  const {
    data: gradesData,
    isLoading,
    isError,
    error,
  } = useSemesterGrades({
    classroomId: selectedClassroomId || undefined,
    subjectId: selectedSubjectId || undefined,
    semesterId: selectedSemesterId || undefined,
  });

  const semesterGrades = gradesData?.data || [];

  const calculateMutation = useCalculateSemesterGrades();
  const upsertMutation = useUpsertSemesterGrade();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<EditingSemesterGradeItem | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCalculate = async () => {
    if (!isFilterComplete) return;
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await calculateMutation.mutateAsync({
        classroomId: selectedClassroomId,
        subjectId: selectedSubjectId,
        semesterId: selectedSemesterId,
      });

      setSuccessMessage(
        `Kalkulasi selesai. Berhasil menghitung dan memperbarui ${res.calculatedCount} nilai akhir semester.`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErrorMessage(
        e.message || "Gagal melakukan kalkulasi nilai semester otomatis."
      );
    }
  };

  const openManualEditModal = (grade: SemesterGrade) => {
    const student = students.find((s) => s.id === grade.studentId);
    setEditingGrade({
      id: grade.id,
      studentId: grade.studentId,
      studentName:
        grade.student?.fullName ||
        student?.fullName ||
        student?.name ||
        "Siswa " + grade.studentId.slice(0, 6),
      finalScore: grade.finalScore,
      letterGrade: grade.letterGrade,
      classroomId: grade.classroomId || selectedClassroomId,
      subjectId: grade.subjectId || selectedSubjectId,
      semesterId: grade.semesterId || selectedSemesterId,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveManualEdit = async (dto: CreateSemesterGradeDto) => {
    try {
      await upsertMutation.mutateAsync(dto);
      setSuccessMessage("Nilai akhir semester berhasil diperbarui.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErrorMessage(e.message || "Gagal memperbarui nilai.");
    }
  };

  const totalCount = semesterGrades.length;
  const averageFinalScore =
    totalCount > 0
      ? (
          semesterGrades.reduce((acc, g) => acc + (g.finalScore || 0), 0) /
          totalCount
        ).toFixed(1)
      : "-";

  const countA = semesterGrades.filter((g) => g.letterGrade === "A").length;
  const countB = semesterGrades.filter((g) => g.letterGrade === "B").length;
  const countC = semesterGrades.filter((g) => g.letterGrade === "C").length;
  const countD = semesterGrades.filter((g) => g.letterGrade === "D").length;

  return (
    <div className="space-y-4">
      <SemesterGradesFilterBar
        selectedClassroomId={selectedClassroomId}
        onChangeClassroom={setSelectedClassroomId}
        selectedSubjectId={selectedSubjectId}
        onChangeSubject={setSelectedSubjectId}
        selectedSemesterId={selectedSemesterId}
        onChangeSemester={setSelectedSemesterId}
        classrooms={classrooms}
        subjects={subjects}
        semesters={semesters}
        isFilterComplete={isFilterComplete}
        onCalculate={handleCalculate}
        isCalculating={calculateMutation.isPending}
      />

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

      {isFilterComplete && totalCount > 0 && (
        <SemesterStatsSummary
          totalCount={totalCount}
          averageFinalScore={averageFinalScore}
          countA={countA}
          countB={countB}
          countC={countC}
          countD={countD}
        />
      )}

      <SemesterGradesTable
        isFilterComplete={isFilterComplete}
        isLoading={isLoading}
        isError={isError}
        error={error}
        semesterGrades={semesterGrades}
        students={students}
        onOpenEdit={openManualEditModal}
      />

      <ManualEditGradeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editingGrade={editingGrade}
        onSave={handleSaveManualEdit}
        isLoading={upsertMutation.isPending}
      />
    </div>
  );
};
