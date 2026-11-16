import React from "react";

interface SemesterStatsSummaryProps {
  totalCount: number;
  averageFinalScore: string;
  countA: number;
  countB: number;
  countC: number;
  countD: number;
}

export const SemesterStatsSummary: React.FC<SemesterStatsSummaryProps> = ({
  totalCount,
  averageFinalScore,
  countA,
  countB,
  countC,
  countD,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
      <div className="bg-white p-3 rounded-lg border border-slate-200">
        <p className="text-[11px] text-slate-500 font-medium">Total Siswa</p>
        <p className="text-lg font-bold text-slate-900 mt-0.5">{totalCount}</p>
      </div>
      <div className="bg-white p-3 rounded-lg border border-slate-200">
        <p className="text-[11px] text-slate-500 font-medium">Rata-rata Akhir</p>
        <p className="text-lg font-bold text-slate-900 mt-0.5 font-mono">
          {averageFinalScore}
        </p>
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
  );
};
