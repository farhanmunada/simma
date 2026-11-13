import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router";
import { Users, UserCheck, CalendarCheck, BarChart3 } from "lucide-react";
import { AttendanceStudentPage } from "./components/AttendanceStudentPage";
import { AttendanceTeacherPage } from "./components/AttendanceTeacherPage";
import { AttendanceRecapPage } from "./components/AttendanceRecapPage";

const tabs = [
  { name: "Presensi Siswa", href: "/attendance", icon: Users },
  { name: "Presensi Guru & GTK", href: "/attendance/teachers", icon: UserCheck },
  { name: "Rekapitulasi", href: "/attendance/recap", icon: BarChart3 },
];

export const AttendanceRoutes: React.FC = () => {
  const location = useLocation();

  const todayStr = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const isTabActive = (tabHref: string) => {
    if (tabHref === "/attendance") {
      return (
        location.pathname === "/attendance" ||
        location.pathname === "/attendance/" ||
        location.pathname.startsWith("/attendance/students")
      );
    }
    return location.pathname.startsWith(tabHref);
  };

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

      {/* Sub navigation bar */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 -mb-px overflow-x-auto" aria-label="Attendance Tabs">
          {tabs.map((tab) => {
            const active = isTabActive(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                to={tab.href}
                className={`flex items-center gap-2 whitespace-nowrap py-2.5 px-1 border-b-2 text-xs font-medium transition-colors ${
                  active
                    ? "border-emerald-600 text-emerald-700 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Child Routes */}
      <Routes>
        <Route index element={<AttendanceStudentPage />} />
        <Route path="students" element={<AttendanceStudentPage />} />
        <Route path="teachers" element={<AttendanceTeacherPage />} />
        <Route path="recap" element={<AttendanceRecapPage />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </div>
  );
};
