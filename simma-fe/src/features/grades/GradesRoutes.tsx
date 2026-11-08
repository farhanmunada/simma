import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router";
import { AssessmentsListPage } from "./components/AssessmentsListPage";
import { GradeInputSheetPage } from "./components/GradeInputSheetPage";
import { SemesterGradesPage } from "./components/SemesterGradesPage";

const tabs = [
  { name: "Rencana Penilaian & Input Nilai", href: "/grades" },
  { name: "Rekap Nilai Semester", href: "/grades/semester" },
];

export const GradesRoutes: React.FC = () => {
  const location = useLocation();

  const isTabActive = (tabHref: string) => {
    if (tabHref === "/grades") {
      return (
        location.pathname === "/grades" ||
        location.pathname === "/grades/" ||
        location.pathname.startsWith("/grades/assessments") ||
        location.pathname.startsWith("/grades/input")
      );
    }
    return location.pathname.startsWith(tabHref);
  };

  return (
    <div className="space-y-4">
      {/* Sub navigation bar */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 -mb-px overflow-x-auto" aria-label="Grades Tabs">
          {tabs.map((tab) => {
            const active = isTabActive(tab.href);
            return (
              <Link
                key={tab.name}
                to={tab.href}
                className={`whitespace-nowrap py-2.5 px-1 border-b-2 text-xs font-medium transition-colors ${
                  active
                    ? "border-emerald-600 text-emerald-700 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Child Routes */}
      <Routes>
        <Route index element={<AssessmentsListPage />} />
        <Route path="assessments" element={<AssessmentsListPage />} />
        <Route path="assessments/:id/input" element={<GradeInputSheetPage />} />
        <Route path="input/:id" element={<GradeInputSheetPage />} />
        <Route path="semester" element={<SemesterGradesPage />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </div>
  );
};
