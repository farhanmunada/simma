import React from "react";
import { Edit3 } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { getLetterGradeBadgeClass } from "../utils/grade-helpers";
import type { SemesterGrade } from "../types";
import type { ReferenceItem } from "../hooks/useGradesReferences";

interface SemesterGradesTableProps {
  isFilterComplete: boolean;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  semesterGrades: SemesterGrade[];
  students: ReferenceItem[];
  onOpenEdit: (grade: SemesterGrade) => void;
}

export const SemesterGradesTable: React.FC<SemesterGradesTableProps> = ({
  isFilterComplete,
  isLoading,
  isError,
  error,
  semesterGrades,
  students,
  onOpenEdit,
}) => {
  const getStudentInfo = (studentId: string) => {
    const found = students.find((s) => s.id === studentId);
    return {
      name: found?.fullName || found?.name || "Siswa " + studentId.slice(0, 6),
      nisn: found?.nisn || found?.nis || "-",
    };
  };

  return (
    <Card>
      {!isFilterComplete ? (
        <div className="p-10 text-center text-slate-500 text-sm">
          Silakan pilih <strong>Kelas</strong>, <strong>Mata Pelajaran</strong>, dan{" "}
          <strong>Semester</strong> di filter atas untuk menampilkan rekap nilai akhir.
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
                  <tr
                    key={grade.id || grade.studentId}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
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
                        onClick={() => onOpenEdit(grade)}
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
  );
};
