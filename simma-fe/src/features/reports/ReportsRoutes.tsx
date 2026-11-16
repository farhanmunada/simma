import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router";
import { FileText, FileSpreadsheet } from "lucide-react";
import { StudentReportCardPage } from "./components/StudentReportCardPage";
import { ClassroomLeggerPage } from "./components/ClassroomLeggerPage";

const tabs = [
  { name: "Buku Rapor Siswa (RDM)", href: "/reports", icon: FileText },
  { name: "Buku Legger Nilai Kelas", href: "/reports/legger", icon: FileSpreadsheet },
];

export const ReportsRoutes: React.FC = () => {
  const location = useLocation();

  const isTabActive = (tabHref: string) => {
    if (tabHref === "/reports") {
      return (
        location.pathname === "/reports" ||
        location.pathname === "/reports/" ||
        location.pathname.startsWith("/reports/student")
      );
    }
    return location.pathname.startsWith(tabHref);
  };

  return (
    <div className="space-y-4">
      {/* Page Header (Screen Only) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Rapor & Legger RDM
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencetakan rapor capaian hasil belajar madrasah dan rekap buku legger nilai rombel
          </p>
        </div>
      </div>

      {/* Sub Navigation Tabs (Screen Only) */}
      <div className="border-b border-slate-200 print:hidden">
        <nav className="flex space-x-6 -mb-px overflow-x-auto" aria-label="Reports Navigation">
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
        <Route index element={<StudentReportCardPage />} />
        <Route path="student" element={<StudentReportCardPage />} />
        <Route path="legger" element={<ClassroomLeggerPage />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </div>
  );
};
