import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router";
import { TahfidzRecordsPage } from "./components/TahfidzRecordsPage";
import { StudentProgressPage } from "./components/StudentProgressPage";
import { TasmiExamsPage } from "./components/TasmiExamsPage";

const tabs = [
  { name: "Setoran Hafalan", href: "/tahfidz", matchPrefix: "/tahfidz" },
  { name: "Progres Hafalan", href: "/tahfidz/progress", matchPrefix: "/tahfidz/progress" },
  { name: "Ujian Tasmi'", href: "/tahfidz/tasmi", matchPrefix: "/tahfidz/tasmi" },
];

export const TahfidzRoutes: React.FC = () => {
  const location = useLocation();

  const isTabActive = (tabHref: string) => {
    if (tabHref === "/tahfidz") {
      return (
        location.pathname === "/tahfidz" ||
        location.pathname === "/tahfidz/" ||
        location.pathname.startsWith("/tahfidz/records")
      );
    }
    return location.pathname.startsWith(tabHref);
  };

  return (
    <div className="space-y-4">
      {/* Sub navigation bar */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 -mb-px overflow-x-auto" aria-label="Tahfidz Tabs">
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
        <Route index element={<TahfidzRecordsPage />} />
        <Route path="records" element={<TahfidzRecordsPage />} />
        <Route path="progress" element={<StudentProgressPage />} />
        <Route path="tasmi" element={<TasmiExamsPage />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </div>
  );
};
