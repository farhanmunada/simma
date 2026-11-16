import React from "react";
import { Card } from "../../../components/ui/Card";
import { calculateLetterGrade, getLetterGradeBadgeClass } from "../utils/grade-helpers";

export interface GradeInputRow {
  studentId: string;
  fullName: string;
  nisn: string;
  nis: string;
  score: number | "";
  feedback: string;
  originalScore: number | "";
  originalFeedback: string;
}

interface GradeInputTableProps {
  rows: GradeInputRow[];
  maxScore: number;
  isLoading: boolean;
  onScoreChange: (index: number, val: string) => void;
  onFeedbackChange: (index: number, val: string) => void;
}

export const GradeInputTable: React.FC<GradeInputTableProps> = ({
  rows,
  maxScore,
  isLoading,
  onScoreChange,
  onFeedbackChange,
}) => {
  return (
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
                  Nilai (0-{maxScore})
                </th>
                <th className="py-2.5 px-3 font-semibold w-24 text-center">Predikat</th>
                <th className="py-2.5 px-3 font-semibold">Catatan / Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {rows.map((row, index) => {
                const hasScore = typeof row.score === "number";
                const letterGrade = hasScore
                  ? calculateLetterGrade(row.score as number)
                  : null;

                return (
                  <tr
                    key={row.studentId}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
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
                        max={maxScore}
                        step="any"
                        value={row.score}
                        placeholder="-"
                        onChange={(e) => onScoreChange(index, e.target.value)}
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
                        onChange={(e) => onFeedbackChange(index, e.target.value)}
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
  );
};
