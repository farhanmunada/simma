import React from "react";
import { CheckCircle2, Layers, Clock, Award, BookOpen } from "lucide-react";
import type { TahfidzProgressSummary as SummaryType, JuzProgress } from "../types";
import { getSurahName } from "../utils";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";

export interface TahfidzProgressSummaryProps {
  summary?: SummaryType | null;
  juzMap: JuzProgress[];
  completedPercent: number;
}

export const TahfidzProgressSummary: React.FC<TahfidzProgressSummaryProps> = ({
  summary,
  juzMap,
  completedPercent,
}) => {
  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Juz Tuntas</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-800">
              {summary?.completedJuzCount || 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 30 Juz</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${completedPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Total Ziyadah</span>
          </div>
          <div className="text-xl font-bold text-slate-800 mt-1">
            {summary?.totalZiyadah || 0}
            <span className="text-xs font-normal text-slate-500 ml-1">kali</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Penambahan ayat baru</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Total Muraja'ah</span>
          </div>
          <div className="text-xl font-bold text-slate-800 mt-1">
            {summary?.totalMurajaah || 0}
            <span className="text-xs font-normal text-slate-500 ml-1">kali</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Pengulangan hafalan</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Tasmi' Lulus</span>
          </div>
          <div className="text-xl font-bold text-slate-800 mt-1">
            {summary?.totalTasmiPassed || 0}
            <span className="text-xs font-normal text-slate-500 ml-1">Juz</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Ujian sekali duduk</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 col-span-2 md:col-span-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hafalan Terakhir</span>
          </div>
          {summary?.lastMemorized ? (
            <div className="mt-1">
              <div className="text-xs font-bold text-slate-800 truncate">
                Juz {summary.lastMemorized.juz} • {getSurahName(summary.lastMemorized.surah)}
              </div>
              <div className="text-[11px] text-slate-500">
                s/d Ayat {summary.lastMemorized.ayahEnd} ({summary.lastMemorized.date})
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 mt-2">Belum ada catatan</div>
          )}
        </div>
      </div>

      {/* 30 Juz Monitoring Grid */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Pemetaan Capaian 30 Juz Al-Qur'an
            </h3>
            <p className="text-xs text-slate-500">
              Status ketuntasan Ziyadah, Muraja'ah, dan kelulusan Tasmi' per Juz
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Tuntas
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              Belum Tuntas
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
          {juzMap.map((item) => (
            <div
              key={item.juz}
              className={`p-3 rounded-md border transition-all ${
                item.isCompleted
                  ? "bg-emerald-50/50 border-emerald-300 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 font-mono">
                  Juz {item.juz}
                </span>
                {item.isCompleted ? (
                  <Badge variant="success" size="sm">
                    Tuntas
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    Proses
                  </Badge>
                )}
              </div>

              <div className="text-[11px] text-slate-600 space-y-0.5 mb-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ziyadah:</span>
                  <span className="font-medium font-mono">{item.ziyadahCount}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Muraja'ah:</span>
                  <span className="font-medium font-mono">{item.murajaahCount}x</span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Tasmi':</span>
                {item.tasmiStatus === "lulus" ? (
                  <span className="font-semibold text-emerald-600">Lulus</span>
                ) : item.tasmiStatus === "perlu_perbaikan" ? (
                  <span className="font-semibold text-amber-600">Perbaikan</span>
                ) : item.tasmiStatus === "tidak_lulus" ? (
                  <span className="font-semibold text-red-600">Gagal</span>
                ) : (
                  <span className="text-slate-400">Belum Ujian</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
