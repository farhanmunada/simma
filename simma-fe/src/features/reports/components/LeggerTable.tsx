import React from "react";
import { Search } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import type { ClassroomLegger } from "../types";

interface LeggerTableProps {
  legger: ClassroomLegger;
  filteredStudents: ClassroomLegger["students"];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const LeggerTable: React.FC<LeggerTableProps> = ({
  legger,
  filteredStudents,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <Card
      header={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Buku Legger Nilai RDM Kelas
            </h3>
            <span className="text-xs text-slate-400">
              ({filteredStudents.length} dari {legger.students.length} siswa)
            </span>
          </div>

          <div className="w-full sm:w-64">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari siswa atau NISN..."
                className="w-full rounded-md border border-slate-300 pl-8 pr-3 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:border-emerald-600 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>
      }
    >
      <div className="overflow-x-auto -mx-4 -mb-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-2.5 w-10 text-center sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                No
              </th>
              <th className="py-2.5 px-3 min-w-36 sticky left-10 bg-slate-50 z-10 border-r border-slate-200 shadow-xs">
                Nama Siswa
              </th>
              <th className="py-2.5 px-2.5 w-24 text-center">NISN</th>
              <th className="py-2.5 px-2 w-10 text-center">L/P</th>

              {/* Dynamic Subject Columns */}
              {legger.subjects.map((sub) => (
                <th
                  key={sub.id}
                  className="py-2.5 px-2 min-w-16 text-center border-l border-slate-200"
                  title={sub.name}
                >
                  <div className="truncate max-w-20 mx-auto font-mono text-[10.5px]">
                    {sub.code || sub.name}
                  </div>
                </th>
              ))}

              {/* Summary Columns */}
              <th className="py-2.5 px-2.5 w-16 text-center border-l-2 border-slate-300 bg-slate-100 font-bold">
                Total
              </th>
              <th className="py-2.5 px-2.5 w-16 text-center bg-slate-100 font-bold">
                Rata²
              </th>
              <th className="py-2.5 px-2.5 w-16 text-center bg-emerald-50 text-emerald-800 font-bold border-r border-slate-200">
                Rank
              </th>

              {/* Attendance Columns */}
              <th className="py-2.5 px-2 w-10 text-center bg-emerald-50/50 text-emerald-700" title="Hadir">
                H
              </th>
              <th className="py-2.5 px-2 w-10 text-center bg-blue-50/50 text-blue-700" title="Izin">
                I
              </th>
              <th className="py-2.5 px-2 w-10 text-center bg-amber-50/50 text-amber-700" title="Sakit">
                S
              </th>
              <th className="py-2.5 px-2 w-10 text-center bg-rose-50/50 text-rose-700" title="Alpa">
                A
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((st, idx) => {
              const gradeMap = new Map<string, { score: number; letter: string }>();
              st.grades.forEach((g) => {
                gradeMap.set(g.subjectId, { score: g.score, letter: g.letterGrade });
              });

              const isTopRank = st.rank <= 3;

              return (
                <tr
                  key={st.studentId}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isTopRank ? "bg-amber-50/20" : ""
                  }`}
                >
                  <td className="py-2 px-2.5 text-center text-slate-500 font-mono sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-900 sticky left-10 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 shadow-xs">
                    <div className="truncate max-w-44">{st.fullName}</div>
                  </td>
                  <td className="py-2 px-2.5 text-center text-slate-500 font-mono text-[11px]">
                    {st.nisn || "-"}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-600 font-medium">
                    {st.gender}
                  </td>

                  {/* Subject Scores */}
                  {legger.subjects.map((sub) => {
                    const grade = gradeMap.get(sub.id);
                    const score = grade?.score;
                    return (
                      <td
                        key={sub.id}
                        className="py-2 px-2 text-center border-l border-slate-100 font-mono"
                      >
                        {score !== undefined ? (
                          <span
                            className={`inline-block px-1 rounded-sm ${
                              score < 70 ? "text-red-600 font-semibold" : "text-slate-800"
                            }`}
                          >
                            {score.toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Total Score */}
                  <td className="py-2 px-2.5 text-center font-bold text-slate-900 border-l-2 border-slate-200 bg-slate-50/70 font-mono">
                    {st.totalScore.toFixed(0)}
                  </td>

                  {/* Average Score */}
                  <td className="py-2 px-2.5 text-center font-bold text-slate-900 bg-slate-50/70 font-mono">
                    {st.averageScore.toFixed(1)}
                  </td>

                  {/* Rank */}
                  <td className="py-2 px-2.5 text-center border-r border-slate-200 bg-emerald-50/30">
                    <span
                      className={`inline-flex items-center justify-center min-w-6 h-5 px-1.5 rounded-full text-xs font-bold ${
                        st.rank === 1
                          ? "bg-amber-500 text-white"
                          : st.rank === 2
                          ? "bg-slate-400 text-white"
                          : st.rank === 3
                          ? "bg-amber-700 text-white"
                          : "text-slate-700"
                      }`}
                    >
                      {st.rank}
                    </span>
                  </td>

                  {/* Attendance */}
                  <td className="py-2 px-2 text-center text-emerald-700 font-medium bg-emerald-50/20">
                    {st.attendance?.hadir ?? 0}
                  </td>
                  <td className="py-2 px-2 text-center text-blue-700 font-medium bg-blue-50/20">
                    {st.attendance?.izin ?? 0}
                  </td>
                  <td className="py-2 px-2 text-center text-amber-700 font-medium bg-amber-50/20">
                    {st.attendance?.sakit ?? 0}
                  </td>
                  <td className="py-2 px-2 text-center text-rose-700 font-medium bg-rose-50/20">
                    {st.attendance?.alpa ?? 0}
                  </td>
                </tr>
              );
            })}
            {filteredStudents.length === 0 && (
              <tr>
                <td
                  colSpan={9 + legger.subjects.length}
                  className="py-8 text-center text-slate-400 italic"
                >
                  Tidak ada siswa yang sesuai dengan kriteria pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
