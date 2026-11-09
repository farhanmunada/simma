import React from "react";
import { Users, UserCheck, Calendar, Filter, RotateCcw, Download } from "lucide-react";
import { STUDENT_STATUS_CONFIG, TEACHER_STATUS_CONFIG } from "../types";

export interface AttendanceFilterBarProps {
  activeTab: "students" | "teachers";
  onTabChange: (tab: "students" | "teachers") => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  selectedClassroomId: string;
  onClassroomIdChange: (id: string) => void;
  selectedStudentStatus: string;
  onStudentStatusChange: (status: string) => void;
  selectedTeacherStatus: string;
  onTeacherStatusChange: (status: string) => void;
  classroomOptions: { value: string; label: string }[];
  onReset: () => void;
  onOpenExport?: () => void;
  onQuickPreset: (preset: "week" | "month") => void;
}

export const AttendanceFilterBar: React.FC<AttendanceFilterBarProps> = ({
  activeTab,
  onTabChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  selectedClassroomId,
  onClassroomIdChange,
  selectedStudentStatus,
  onStudentStatusChange,
  selectedTeacherStatus,
  onTeacherStatusChange,
  classroomOptions,
  onReset,
  onOpenExport,
  onQuickPreset,
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-4">
      {/* Scope Switcher & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="inline-flex rounded-md p-1 bg-slate-100 border border-slate-200 self-start">
          <button
            type="button"
            onClick={() => onTabChange("students")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === "students"
                ? "bg-white text-emerald-700 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Rekap Siswa
          </button>
          <button
            type="button"
            onClick={() => onTabChange("teachers")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === "teachers"
                ? "bg-white text-emerald-700 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Rekap Guru & GTK
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onQuickPreset("week")}
            className="text-2xs font-medium text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-2 py-1 rounded transition-colors"
          >
            7 Hari Terakhir
          </button>
          <button
            type="button"
            onClick={() => onQuickPreset("month")}
            className="text-2xs font-medium text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-2 py-1 rounded transition-colors"
          >
            Bulan Ini
          </button>
          {onOpenExport && (
            <button
              type="button"
              onClick={onOpenExport}
              className="flex items-center gap-1 text-2xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded transition-colors ml-1"
            >
              <Download className="w-3 h-3" />
              Ekspor Laporan
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 items-end">
        <div>
          <label className="block text-2xs font-medium text-slate-600 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-2xs font-medium text-slate-600 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Tanggal Akhir
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {activeTab === "students" && (
          <div>
            <label className="block text-2xs font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              Rombel / Kelas
            </label>
            <select
              value={selectedClassroomId}
              onChange={(e) => onClassroomIdChange(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {classroomOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-2xs font-medium text-slate-600 mb-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Status Kehadiran
          </label>
          {activeTab === "students" ? (
            <select
              value={selectedStudentStatus}
              onChange={(e) => onStudentStatusChange(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Semua Status</option>
              {Object.entries(STUDENT_STATUS_CONFIG).map(([val, cfg]) => (
                <option key={val} value={val}>
                  {cfg.label}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedTeacherStatus}
              onChange={(e) => onTeacherStatusChange(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Semua Status</option>
              {Object.entries(TEACHER_STATUS_CONFIG).map(([val, cfg]) => (
                <option key={val} value={val}>
                  {cfg.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={onReset}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-xs text-slate-600 hover:text-slate-800 rounded-md transition-colors font-medium bg-slate-50 hover:bg-slate-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filter
          </button>
        </div>
      </div>
    </div>
  );
};
