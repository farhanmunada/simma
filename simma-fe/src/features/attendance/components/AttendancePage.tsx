import React, { useState } from "react";
import { Users, UserCheck, CalendarCheck, BarChart3 } from "lucide-react";
import { AttendanceStudentPage } from "./AttendanceStudentPage";
import { AttendanceTeacherPage } from "./AttendanceTeacherPage";
import { AttendanceRecapPage } from "./AttendanceRecapPage";

type AttendanceTab = "students" | "teachers" | "recap";

export const AttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AttendanceTab>("students");

  const todayStr = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            Presensi Harian
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan dan monitoring kehadiran santri/siswa serta ustadz/guru madrasah
          </p>
        </div>
        <div className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs self-start sm:self-auto">
          Hari ini: <span className="font-semibold text-emerald-700">{todayStr}</span>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-2 py-2.5 px-1 border-b-2 font-medium text-xs transition-colors ${
              activeTab === "students"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Users className="w-4 h-4" />
            Presensi Siswa
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("teachers")}
            className={`flex items-center gap-2 py-2.5 px-1 border-b-2 font-medium text-xs transition-colors ${
              activeTab === "teachers"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Presensi Guru & GTK
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("recap")}
            className={`flex items-center gap-2 py-2.5 px-1 border-b-2 font-medium text-xs transition-colors ${
              activeTab === "recap"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Rekapitulasi Kehadiran
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "students" && <AttendanceStudentPage />}
        {activeTab === "teachers" && <AttendanceTeacherPage />}
        {activeTab === "recap" && <AttendanceRecapPage />}
      </div>
    </div>
  );
};
