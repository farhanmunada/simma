import React from "react";
import { Users, TrendingUp, Trophy, ArrowUpDown } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import type { ClassroomLegger } from "../types";

interface LeggerStatsCardsProps {
  legger: ClassroomLegger;
}

export const LeggerStatsCards: React.FC<LeggerStatsCardsProps> = ({ legger }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="p-3 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Total Siswa</span>
            <span className="text-lg font-bold text-slate-900 leading-tight">
              {legger.classStatistics?.totalStudents ?? legger.students.length}
            </span>
            <span className="text-[10px] text-slate-400 block">Peserta Didik</span>
          </div>
        </div>
      </Card>

      <Card className="p-3 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Rata-rata Kelas</span>
            <span className="text-lg font-bold text-sky-700 leading-tight">
              {(legger.classStatistics?.classAverage ?? 0).toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 block">Skala 0 - 100</span>
          </div>
        </div>
      </Card>

      <Card className="p-3 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Nilai Tertinggi</span>
            <span className="text-lg font-bold text-amber-700 leading-tight">
              {(legger.classStatistics?.highestScore ?? 0).toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 block">Pencapaian Maksimal</span>
          </div>
        </div>
      </Card>

      <Card className="p-3 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
            <ArrowUpDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Nilai Terendah</span>
            <span className="text-lg font-bold text-slate-800 leading-tight">
              {(legger.classStatistics?.lowestScore ?? 0).toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 block">Batas Bawah Kelas</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
