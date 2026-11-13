import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Save, Sparkles, CheckCircle2, RotateCcw } from "lucide-react";
import {
  useAssessmentById,
  useGradesByAssessmentId,
  useBatchUpsertGrades,
  useStudentsByClass,
  useClassroomsReference,
  useSubjectsReference,
} from "../api/grades.api";
import { formatAssessmentTypeLabel } from "../utils/grade-helpers";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { GradeSummaryStats } from "./GradeSummaryStats";
import { GradeInputTable, type GradeInputRow } from "./GradeInputTable";

export const GradeInputSheetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: assessment, isLoading: isAssessmentLoading } = useAssessmentById(id);
  const { data: classrooms = [] } = useClassroomsReference();
  const { data: subjects = [] } = useSubjectsReference();

  const classroomId = assessment?.classroomId;
  const { data: students = [], isLoading: isStudentsLoading } = useStudentsByClass(classroomId);
  const { data: existingGrades = [], isLoading: isGradesLoading } = useGradesByAssessmentId(id);

  const batchUpsertMutation = useBatchUpsertGrades();

  const [rows, setRows] = useState<GradeInputRow[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!students || students.length === 0) {
      if (existingGrades && existingGrades.length > 0) {
        setRows(
          existingGrades.map((g) => ({
            studentId: g.studentId,
            fullName: g.student?.fullName || "Siswa " + g.studentId.slice(0, 6),
            nisn: g.student?.nisn || "-",
            nis: g.student?.nis || "-",
            score: g.score,
            feedback: g.feedback || "",
            originalScore: g.score,
            originalFeedback: g.feedback || "",
          }))
        );
      }
      return;
    }

    const gradeMap = new Map(existingGrades.map((g) => [g.studentId, g]));

    const mergedRows: GradeInputRow[] = students.map((s) => {
      const existing = gradeMap.get(s.id);
      return {
        studentId: s.id,
        fullName: s.fullName || s.name || "Siswa",
        nisn: s.nisn || "-",
        nis: s.nis || "-",
        score: existing !== undefined ? existing.score : "",
        feedback: existing?.feedback || "",
        originalScore: existing !== undefined ? existing.score : "",
        originalFeedback: existing?.feedback || "",
      };
    });

    setRows(mergedRows);
  }, [students, existingGrades]);

  const handleScoreChange = (index: number, val: string) => {
    setRows((prev) => {
      const next = [...prev];
      if (val === "") {
        next[index].score = "";
      } else {
        const num = parseFloat(val);
        const max = assessment?.maxScore ?? 100;
        if (!isNaN(num)) {
          const clamped = Math.max(0, Math.min(num, max));
          next[index].score = clamped;
        }
      }
      return next;
    });
  };

  const handleFeedbackChange = (index: number, val: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[index].feedback = val;
      return next;
    });
  };

  const handleSetAllPerfect = () => {
    const max = assessment?.maxScore ?? 100;
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        score: max,
      }))
    );
  };

  const handleReset = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        score: "",
        feedback: "",
      }))
    );
  };

  const handleSaveBatch = async () => {
    if (!id) return;
    setSuccessMessage(null);
    setErrorMessage(null);

    const validGrades = rows
      .filter((r) => r.score !== "" && typeof r.score === "number")
      .map((r) => ({
        studentId: r.studentId,
        score: Number(r.score),
        feedback: r.feedback.trim() || null,
      }));

    if (validGrades.length === 0) {
      setErrorMessage("Belum ada nilai yang diisi untuk disimpan.");
      return;
    }

    try {
      await batchUpsertMutation.mutateAsync({
        assessmentId: id,
        grades: validGrades,
      });
      setSuccessMessage(`Berhasil menyimpan ${validGrades.length} nilai siswa.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErrorMessage(e.message || "Gagal menyimpan nilai secara massal.");
    }
  };

  const filledCount = rows.filter((r) => r.score !== "").length;
  const averageScore =
    filledCount > 0
      ? (
          rows.reduce((acc, r) => acc + (typeof r.score === "number" ? r.score : 0), 0) /
          filledCount
        ).toFixed(1)
      : "-";

  const getClassName = (cId?: string) =>
    classrooms.find((c) => c.id === cId)?.name || classrooms.find((c) => c.id === cId)?.code || cId;

  const getSubjectName = (sId?: string) =>
    subjects.find((s) => s.id === sId)?.name || subjects.find((s) => s.id === sId)?.code || sId;

  const isLoading = isAssessmentLoading || isStudentsLoading || isGradesLoading;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Link to="/grades/assessments">
            <Button variant="outline" size="sm" className="h-8 px-2 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              <span>Daftar Penilaian</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              {assessment?.title || "Lembar Input Nilai Siswa"}
            </h1>
            <p className="text-xs text-slate-500">
              Kelas: <span className="font-medium text-slate-700">{getClassName(classroomId)}</span>{" "}
              | Mapel:{" "}
              <span className="font-medium text-slate-700">{getSubjectName(assessment?.subjectId)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs"
            title="Kosongkan Semua Nilai"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSetAllPerfect}
            className="flex items-center gap-1 text-xs"
            title={`Isi semua dengan ${assessment?.maxScore ?? 100}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Set Maksimal</span>
          </Button>
          <Button
            type="button"
            isLoading={batchUpsertMutation.isPending}
            onClick={handleSaveBatch}
            className="flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Nilai</span>
          </Button>
        </div>
      </div>

      {/* Assessment Info Pill */}
      {assessment && (
        <Card className="p-3 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500">Tipe: </span>
              <Badge variant="info">{formatAssessmentTypeLabel(assessment.type)}</Badge>
            </div>
            <div>
              <span className="text-slate-500">Skor Maksimal: </span>
              <span className="font-bold text-slate-800">{assessment.maxScore}</span>
            </div>
            <div>
              <span className="text-slate-500">Bobot: </span>
              <span className="font-bold text-slate-800">{assessment.weight}x</span>
            </div>
          </div>
        </Card>
      )}

      {/* Status Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Stats Summary Bar */}
      <GradeSummaryStats
        totalStudents={rows.length}
        filledCount={filledCount}
        averageScore={averageScore}
      />

      {/* Sheet Table */}
      <GradeInputTable
        rows={rows}
        maxScore={assessment?.maxScore ?? 100}
        isLoading={isLoading}
        onScoreChange={handleScoreChange}
        onFeedbackChange={handleFeedbackChange}
      />

      {/* Bottom Sticky Action Bar */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          isLoading={batchUpsertMutation.isPending}
          onClick={handleSaveBatch}
          className="flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Nilai</span>
        </Button>
      </div>
    </div>
  );
};
