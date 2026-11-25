import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router";
import { StudentsListPage } from "./components/StudentsListPage";
import { StudentDetailPage } from "./components/StudentDetailPage";
import { ClassAssignmentPage } from "./components/ClassAssignmentPage";
import { AcademicYearsPage } from "../settings/components/AcademicYearsPage";
import { SemestersPage } from "../settings/components/SemestersPage";
import { ClassroomsPage } from "../settings/components/ClassroomsPage";
import { SubjectsPage } from "../settings/components/SubjectsPage";
import { RouteRoleGuard } from "../auth";
import { MODULE_ROLES } from "../../config/roles";
import { useAuthStore } from "../../stores/auth.store";

const tabs = [
  { name: "Buku Induk", href: "/students", exact: true },
  { name: "Tahun Ajaran", href: "/students/academic-years", roles: MODULE_ROLES.STUDENTS_MASTER },
  { name: "Semester", href: "/students/semesters", roles: MODULE_ROLES.STUDENTS_MASTER },
  { name: "Kelas & Rombel", href: "/students/classrooms", roles: MODULE_ROLES.STUDENTS_MASTER },
  { name: "Mata Pelajaran", href: "/students/subjects", roles: MODULE_ROLES.STUDENTS_MASTER },
  { name: "Penempatan Rombel", href: "/students/assign", roles: MODULE_ROLES.STUDENTS_MASTER },
];

export const StudentsRoutes: React.FC = () => {
  const location = useLocation();
  const hasRole = useAuthStore((s) => s.hasRole);
  const visibleTabs = tabs.filter((tab) => !tab.roles || hasRole(tab.roles));
  const isDetailPage =
    location.pathname.startsWith("/students/") &&
    !location.pathname.startsWith("/students/assign") &&
    !location.pathname.startsWith("/students/classes") &&
    !location.pathname.startsWith("/students/academic-years") &&
    !location.pathname.startsWith("/students/semesters") &&
    !location.pathname.startsWith("/students/classrooms") &&
    !location.pathname.startsWith("/students/subjects");

  return (
    <div className="space-y-4">
      {/* Sub navigation bar (hidden on student detail page for maximum focus) */}
      {!isDetailPage && (
        <div className="border-b border-slate-200">
          <nav className="flex space-x-6 -mb-px overflow-x-auto" aria-label="Students Tabs">
            {visibleTabs.map((tab) => {
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
        <Route
          path="academic-years"
          element={
            <RouteRoleGuard roles={MODULE_ROLES.STUDENTS_MASTER}>
              <AcademicYearsPage />
            </RouteRoleGuard>
          }
        />
        <Route
          path="semesters"
          element={
            <RouteRoleGuard roles={MODULE_ROLES.STUDENTS_MASTER}>
              <SemestersPage />
            </RouteRoleGuard>
          }
        />
        <Route
          path="classrooms"
          element={
            <RouteRoleGuard roles={MODULE_ROLES.STUDENTS_MASTER}>
              <ClassroomsPage />
            </RouteRoleGuard>
          }
        />
        <Route
          path="subjects"
          element={
            <RouteRoleGuard roles={MODULE_ROLES.STUDENTS_MASTER}>
              <SubjectsPage />
            </RouteRoleGuard>
          }
        />
        <Route
          path="assign"
          element={
            <RouteRoleGuard roles={MODULE_ROLES.STUDENTS_MASTER}>
              <ClassAssignmentPage />
            </RouteRoleGuard>
          }
        />
        <Route path="classes" element={<Navigate to="/students/assign" replace />} />
        <Route path=":id" element={<StudentDetailPage />} />
        <Route path="*" element={<Navigate to="/students" replace />} />
      </Routes>
    </div>
  );
};
