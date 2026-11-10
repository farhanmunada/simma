import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router";
import { StudentsListPage } from "./components/StudentsListPage";
import { StudentDetailPage } from "./components/StudentDetailPage";
import { ClassAssignmentPage } from "./components/ClassAssignmentPage";

const tabs = [
  { name: "Daftar Siswa", href: "/students", exact: true },
  { name: "Penempatan Kelas", href: "/students/assign" },
];

export const StudentsRoutes: React.FC = () => {
  const location = useLocation();
  const isDetailPage =
    location.pathname.startsWith("/students/") &&
    !location.pathname.startsWith("/students/assign") &&
    !location.pathname.startsWith("/students/classes");

  return (
    <div className="space-y-4">
      {/* Sub navigation bar (hidden on student detail page for maximum focus) */}
      {!isDetailPage && (
        <div className="border-b border-slate-200">
          <nav className="flex space-x-6 -mb-px overflow-x-auto" aria-label="Students Tabs">
            {tabs.map((tab) => {
              const isActive = tab.exact
                ? location.pathname === tab.href || location.pathname === `${tab.href}/`
                : location.pathname.startsWith(tab.href);

              return (
                <Link
                  key={tab.name}
                  to={tab.href}
                  className={`whitespace-nowrap py-2.5 px-1 border-b-2 text-xs font-medium transition-colors ${
                    isActive
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
      )}

      {/* Child Routes */}
      <Routes>
        <Route index element={<StudentsListPage />} />
        <Route path="assign" element={<ClassAssignmentPage />} />
        <Route path="classes" element={<Navigate to="/students/assign" replace />} />
        <Route path=":id" element={<StudentDetailPage />} />
        <Route path="*" element={<Navigate to="/students" replace />} />
      </Routes>
    </div>
  );
};
