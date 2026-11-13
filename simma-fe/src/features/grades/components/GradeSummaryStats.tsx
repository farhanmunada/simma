import React from "react";

interface GradeSummaryStatsProps {
  totalStudents: number;
  filledCount: number;
  averageScore: string;
}

export const GradeSummaryStats: React.FC<GradeSummaryStatsProps> = ({
  totalStudents,
  filledCount,
  averageScore,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-white p-3 rounded-lg border border-slate-200">
        <p className="text-[11px] text-slate-500 font-medium">Total Siswa</p>
        <p className="text-lg font-bold text-slate-900 mt-0.5">{totalStudents}</p>
      </div>
      <div className="bg-white p-3 rounded-lg border border-slate-200">
        <p className="text-[11px] text-slate-500 font-medium">Sudah Dinilai</p>
        <p className="text-lg font-bold text-emerald-600 mt-0.5">
          {filledCount}{" "}
          <span className="text-xs font-normal text-slate-500">
            / {totalStudents}
          </span>
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg border border-slate-200">
        <p className="text-[11px] text-slate-500 font-medium">Belum Dinilai</p>
        <p className="text-lg font-bold text-amber-600 mt-0.5">
          {totalStudents - filledCount}
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg border border-slate-200">
        <p className="text-[11px] text-slate-500 font-medium">Rata-rata Kelas</p>
        <p className="text-lg font-bold text-slate-900 mt-0.5 font-mono">
          {averageScore}
        </p>
      </div>
    </div>
  );
};
