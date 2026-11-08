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
import {
  formatAssessmentTypeLabel,
  calculateLetterGrade,
  getLetterGradeBadgeClass,
} from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";

interface StudentRow {
  studentId: string;
  fullName: string;
  nisn: string;
  nis: string;
  score: number | "";
  feedback: string;
}

export const GradeInputSheetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: assessment, isLoading: isAssessmentLoading } = useAssessmentById(id);
  const { data: classrooms = [] } = useClassroomsReference();
  const { data: subjects = [] } = useSubjectsReference();

  const classroomId = assessment?.classroomId;
  const { data: students = [], isLoading: isStudentsLoading } = useStudentsByClass(classroomId);
  const { data: existingGrades = [], isLoading: isGradesLoading } = useGradesByAssessmentId(id);

  const batchUpsertMutation = useBatchUpsertGrades();

  const [rows, setRows] = useState<StudentRow[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or merge student rows with existing grades
  useEffect(() => {
    if (!students || students.length === 0) {
      // If no students returned via class query, fallback to existing grades if available
      if (existingGrades && existingGrades.length > 0) {
        setRows(
          existingGrades.map((g) => ({
            studentId: g.studentId,
            fullName: g.student?.fullName || "Siswa " + g.studentId.slice(0, 6),
            nisn: g.student?.nisn || "-",
            nis: g.student?.nis || "-",
            score: g.score,
            feedback: g.feedback || "",
          }))
        );
      }
      return;
    }

    const gradeMap = new Map(existingGrades.map((g) => [g.studentId, g]));

    const mergedRows: StudentRow[] = students.map((s) => {
      const existing = gradeMap.get(s.id);
      return {
        studentId: s.id,
        fullName: s.fullName || s.name || "Siswa",
        nisn: s.nisn || "-",
        nis: s.nis || "-",
        score: existing !== undefined ? existing.score : "",
        feedback: existing?.feedback || "",
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
          // Clamp score between 0 and maxScore
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
      setSuccessMessage(
        `Berhasil menyimpan ${validGrades.length} nilai siswa.`
      );
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
      {/* Top Header Card */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/grades">
              <Button size="sm" variant="outline" className="h-8 px-2 text-xs flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {assessment?.title || "Lembar Input Nilai"}
                </h2>
                {assessment && (
                  <Badge variant="info" size="sm">
                    {formatAssessmentTypeLabel(assessment.type)}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                <span>Kelas: <strong className="text-slate-700">{getClassName(assessment?.classroomId)}</strong></span>
                <span>Mapel: <strong className="text-slate-700">{getSubjectName(assessment?.subjectId)}</strong></span>
                <span>Skor Maks: <strong className="text-slate-700 font-mono">{assessment?.maxScore ?? 100}</strong></span>
                <span>Bobot: <strong className="text-slate-700 font-mono">{assessment?.weight ?? 1}x</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSetAllPerfect}
              className="text-xs flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Isi Maksimal</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </Button>
            <Button
              type="button"
              size="sm"
              isLoading={batchUpsertMutation.isPending}
              onClick={handleSaveBatch}
              className="flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Massal</span>
            </Button>
          </div>
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
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <p className="text-[11px] text-slate-500 font-medium">Total Siswa</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{rows.length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <p className="text-[11px] text-slate-500 font-medium">Sudah Dinilai</p>
          <p className="text-lg font-bold text-emerald-600 mt-0.5">
            {filledCount} <span className="text-xs font-normal text-slate-500">/ {rows.length}</span>
          </p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <p className="text-[11px] text-slate-500 font-medium">Belum Dinilai</p>
          <p className="text-lg font-bold text-amber-600 mt-0.5">
            {rows.length - filledCount}
          </p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <p className="text-[11px] text-slate-500 font-medium">Rata-rata Kelas</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5 font-mono">{averageScore}</p>
        </div>
      </div>

      {/* Sheet Table */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Memuat daftar siswa & lembar nilai...
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            Tidak ada siswa terdaftar di kelas ini atau data siswa belum dikonfigurasi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="py-2.5 px-3 font-semibold w-12 text-center">No</th>
                  <th className="py-2.5 px-3 font-semibold">Nama Siswa</th>
                  <th className="py-2.5 px-3 font-semibold w-28">NISN / NIS</th>
                  <th className="py-2.5 px-3 font-semibold w-36 text-center">
                    Nilai (0-{assessment?.maxScore ?? 100})
                  </th>
                  <th className="py-2.5 px-3 font-semibold w-24 text-center">Predikat</th>
                  <th className="py-2.5 px-3 font-semibold">Catatan / Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {rows.map((row, index) => {
                  const hasScore = typeof row.score === "number";
                  const letterGrade = hasScore ? calculateLetterGrade(row.score as number) : null;

                  return (
                    <tr key={row.studentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-500 font-mono">
                        {index + 1}
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-medium text-slate-900">{row.fullName}</span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                        {row.nisn !== "-" ? row.nisn : row.nis}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          tabIndex={index + 1}
                          min={0}
                          max={assessment?.maxScore ?? 100}
                          step="any"
                          value={row.score}
                          placeholder="-"
                          onChange={(e) => handleScoreChange(index, e.target.value)}
                          className="w-24 text-center font-mono font-semibold py-1 px-2 border border-slate-300 rounded focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        {letterGrade ? (
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-bold rounded border ${getLetterGradeBadgeClass(
                              letterGrade
                            )}`}
                          >
                            {letterGrade}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          tabIndex={rows.length + index + 1}
                          value={row.feedback}
                          placeholder="Catatan guru (opsional)..."
                          onChange={(e) => handleFeedbackChange(index, e.target.value)}
                          className="w-full py-1 px-2 text-xs border border-slate-200 rounded focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-slate-700 placeholder:text-slate-400"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Bottom Sticky Action Bar on Mobile/Scroll */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          isLoading={batchUpsertMutation.isPending}
          onClick={handleSaveBatch}
          className="flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Nilai ({filledCount} Siswa)</span>
        </Button>
      </div>
    </div>
  );
};
