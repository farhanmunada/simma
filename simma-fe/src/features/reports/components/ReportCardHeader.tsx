import React from "react";
import { Card } from "../../../components/ui/Card";
import type { StudentReportCard } from "../types";
import { formatSemesterType } from "../utils";

interface ReportCardHeaderProps {
  report: StudentReportCard;
}

export const ReportCardHeader: React.FC<ReportCardHeaderProps> = ({ report }) => {
  return (
    <Card className="bg-white">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 uppercase font-medium">Nama Peserta Didik</span>
          <p className="text-sm font-bold text-slate-900 leading-tight">{report.student.fullName}</p>
          <p className="text-xs text-slate-500 font-mono">
            NISN: {report.student.nisn || "-"} / NIS: {report.student.nis || "-"}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 uppercase font-medium">Madrasah & Kelas</span>
          <p className="text-sm font-semibold text-slate-800 leading-tight">
            {report.classroom.name} (Tingkat {report.classroom.gradeLevel})
          </p>
          <p className="text-xs text-slate-500">
            Wali Kelas: {report.classroom.homeroomTeacher?.fullName || "-"}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 uppercase font-medium">Periode Akademik</span>
          <p className="text-sm font-semibold text-slate-800 leading-tight">
            {formatSemesterType(report.semester.type)}
          </p>
          <p className="text-xs text-slate-500">
            Tahun Ajaran {report.academicYear.name}
          </p>
        </div>

        <div className="space-y-1 bg-emerald-50/60 p-2.5 rounded-md border border-emerald-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-800 uppercase font-semibold">Capaian Kelas</span>
            {report.summary.rankInClass && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-sm bg-emerald-600 text-white">
                Rank #{report.summary.rankInClass}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold text-emerald-700">
              {report.summary.averageScore.toFixed(1)}
            </span>
            <span className="text-xs text-emerald-600">
              Rata-rata (Total: {report.summary.totalScore.toFixed(0)})
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
