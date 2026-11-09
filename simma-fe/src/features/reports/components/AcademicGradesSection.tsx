import React from "react";
import { Card } from "../../../components/ui/Card";
import type { StudentReportGrade } from "../types";
import { getLetterGradeBadgeClass } from "../utils";

interface AcademicGradesSectionProps {
  grades: StudentReportGrade[];
}

export const AcademicGradesSection: React.FC<AcademicGradesSectionProps> = ({ grades }) => {
  const groupedGrades = React.useMemo(() => {
    const groups: Record<string, StudentReportGrade[]> = {};
    grades.forEach((g) => {
      const key = g.group || "A";
      if (!groups[key]) groups[key] = [];
      groups[key].push(g);
    });
    return groups;
  }, [grades]);

  return (
    <Card header="Capaian Hasil Belajar (Nilai Akhir & Predikat)">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3 w-10 text-center">No</th>
              <th className="py-2.5 px-3">Mata Pelajaran</th>
              <th className="py-2.5 px-3 w-24 text-center">Nilai Akhir</th>
              <th className="py-2.5 px-3 w-24 text-center">Predikat</th>
              <th className="py-2.5 px-4">Deskripsi Capaian Kompetensi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.entries(groupedGrades).map(([groupName, groupItems]) => (
              <React.Fragment key={groupName}>
                <tr className="bg-slate-100/70 font-semibold text-slate-700">
                  <td colSpan={5} className="py-1.5 px-3 text-[11px]">
                    Kelompok: {groupName}
                  </td>
                </tr>
                {groupItems.map((g, idx) => (
                  <tr key={g.subjectId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      <div>{g.subjectName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{g.subjectCode}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900 text-sm">
                      {g.finalScore.toFixed(0)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs ${getLetterGradeBadgeClass(
                          g.letterGrade
                        )}`}
                      >
                        {g.letterGrade}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 leading-relaxed text-[11.5px]">
                      {g.description || "Telah mencapai kompetensi dengan baik."}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {grades.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                  Belum ada nilai semester yang dikalkulasi untuk siswa ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
