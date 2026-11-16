import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router";
import { Users, Clock, Award } from "lucide-react";
import { TeacherListPage } from "./pages/TeacherListPage";
import { TeacherWorkloadPage } from "./pages/TeacherWorkloadPage";
import { TeacherMonitoringPage } from "./pages/TeacherMonitoringPage";

const tabs = [
  { name: "Direktori GTK", href: "/teachers", exact: true, icon: Users },
  { name: "Beban Kerja (24 JTM)", href: "/teachers/workloads", exact: false, icon: Clock },
  { name: "Monitoring & Pangkat", href: "/teachers/monitoring", exact: false, icon: Award },
];

export const TeachersRoutes: React.FC = () => {
  const location = useLocation();

  const isTabActive = (tab: (typeof tabs)[0]) => {
    if (tab.exact) {
      return location.pathname === tab.href || location.pathname === `${tab.href}/`;
    }
    return location.pathname.startsWith(tab.href);
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab);
            return (
              <Link
                key={tab.name}
                to={tab.href}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <Routes>
        <Route index element={<TeacherListPage />} />
        <Route path="workloads" element={<TeacherWorkloadPage />} />
        <Route path="monitoring" element={<TeacherMonitoringPage />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </div>
  );
};
