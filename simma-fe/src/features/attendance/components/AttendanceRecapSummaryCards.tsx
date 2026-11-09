import React from "react";
import { CheckCircle2, AlertCircle, Clock, XCircle, Briefcase, BarChart2 } from "lucide-react";

export interface StudentStats {
  total: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  percentage: number;
}

export interface TeacherStats {
  total: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  dinasLuar: number;
  percentage: number;
}

export interface AttendanceRecapSummaryCardsProps {
  activeTab: "students" | "teachers";
  studentStats: StudentStats;
  teacherStats: TeacherStats;
}

export const AttendanceRecapSummaryCards: React.FC<AttendanceRecapSummaryCardsProps> = ({
  activeTab,
  studentStats,
  teacherStats,
}) => {
  if (activeTab === "students") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-slate-500">Total Presensi</span>
            <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-800 mt-1">{studentStats.total}</p>
          <span className="text-2xs text-slate-400">rekaman periode ini</span>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-emerald-800">Hadir</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-emerald-700 mt-1">{studentStats.hadir}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex-1 bg-emerald-200 rounded-full h-1">
              <div
                className="bg-emerald-600 h-1 rounded-full"
                style={{ width: `${Math.min(studentStats.percentage, 100)}%` }}
              />
            </div>
            <span className="text-2xs font-semibold text-emerald-700">{studentStats.percentage}%</span>
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-amber-800">Sakit</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-lg font-bold text-amber-700 mt-1">{studentStats.sakit}</p>
          <span className="text-2xs text-amber-600">
            {studentStats.total > 0 ? ((studentStats.sakit / studentStats.total) * 100).toFixed(1) : 0}%
          </span>
        </div>

        <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-blue-800">Izin</span>
            <Clock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-blue-700 mt-1">{studentStats.izin}</p>
          <span className="text-2xs text-blue-600">
            {studentStats.total > 0 ? ((studentStats.izin / studentStats.total) * 100).toFixed(1) : 0}%
          </span>
        </div>

        <div className="bg-rose-50/60 border border-rose-200/80 rounded-lg p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-rose-800">Alpa</span>
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <p className="text-lg font-bold text-rose-700 mt-1">{studentStats.alpa}</p>
          <span className="text-2xs text-rose-600">
            {studentStats.total > 0 ? ((studentStats.alpa / studentStats.total) * 100).toFixed(1) : 0}%
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-slate-600">Disiplin</span>
            <span className="text-2xs font-bold text-emerald-700">EMIS</span>
          </div>
          <p className="text-lg font-bold text-slate-700 mt-1">{studentStats.percentage}%</p>
          <span className="text-2xs text-slate-500">Tingkat kehadiran</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-medium text-slate-500">Total Presensi</span>
          <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <p className="text-lg font-bold text-slate-800 mt-1">{teacherStats.total}</p>
        <span className="text-2xs text-slate-400">rekaman GTK</span>
      </div>

      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-medium text-emerald-800">Hadir</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <p className="text-lg font-bold text-emerald-700 mt-1">{teacherStats.hadir}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex-1 bg-emerald-200 rounded-full h-1">
            <div
              className="bg-emerald-600 h-1 rounded-full"
              style={{ width: `${Math.min(teacherStats.percentage, 100)}%` }}
            />
          </div>
          <span className="text-2xs font-semibold text-emerald-700">{teacherStats.percentage}%</span>
        </div>
      </div>

      <div className="bg-purple-50/60 border border-purple-200/80 rounded-lg p-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-medium text-purple-800">Dinas Luar</span>
          <Briefcase className="w-3.5 h-3.5 text-purple-600" />
        </div>
        <p className="text-lg font-bold text-purple-700 mt-1">{teacherStats.dinasLuar}</p>
        <span className="text-2xs text-purple-600">Tugas Kedinasan</span>
      </div>

      <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-medium text-amber-800">Sakit / Izin</span>
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <p className="text-lg font-bold text-amber-700 mt-1">{teacherStats.sakit + teacherStats.izin}</p>
        <span className="text-2xs text-amber-600">
          S:{teacherStats.sakit} | I:{teacherStats.izin}
        </span>
      </div>

      <div className="bg-rose-50/60 border border-rose-200/80 rounded-lg p-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-medium text-rose-800">Alpa</span>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
        </div>
        <p className="text-lg font-bold text-rose-700 mt-1">{teacherStats.alpa}</p>
        <span className="text-2xs text-rose-600">Tanpa Keterangan</span>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-medium text-slate-600">Simpatika</span>
          <span className="text-2xs font-bold text-emerald-700">24 JTM</span>
        </div>
        <p className="text-lg font-bold text-slate-700 mt-1">{teacherStats.percentage}%</p>
        <span className="text-2xs text-slate-500">Tingkat kehadiran</span>
      </div>
    </div>
  );
};
