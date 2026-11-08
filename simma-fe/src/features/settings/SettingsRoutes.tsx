import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router";
import { AcademicYearsPage } from "./components/AcademicYearsPage";
import { SemestersPage } from "./components/SemestersPage";
import { ClassroomsPage } from "./components/ClassroomsPage";
import { SubjectsPage } from "./components/SubjectsPage";
import { TeachersPage } from "./components/TeachersPage";

const tabs = [
  { name: "Tahun Ajaran", href: "/settings/academic-years" },
  { name: "Semester", href: "/settings/semesters" },
  { name: "Kelas & Rombel", href: "/settings/classrooms" },
  { name: "Mata Pelajaran", href: "/settings/subjects" },
  { name: "Guru & GTK", href: "/settings/teachers" },
];

export const SettingsRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <div className="space-y-4">
      {/* Sub navigation bar */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 -mb-px overflow-x-auto" aria-label="Master Data Tabs">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.href);
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

      {/* Child Routes */}
      <Routes>
        <Route index element={<Navigate to="academic-years" replace />} />
        <Route path="academic-years" element={<AcademicYearsPage />} />
        <Route path="semesters" element={<SemestersPage />} />
        <Route path="classrooms" element={<ClassroomsPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="*" element={<Navigate to="academic-years" replace />} />
      </Routes>
    </div>
  );
};
