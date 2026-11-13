import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router";
import { ClipboardCheck, Award, BookCheck } from "lucide-react";
import { MutabaahDailyChecklistPage } from "./pages/MutabaahDailyChecklistPage";
import { MutabaahCompliancePage } from "./pages/MutabaahCompliancePage";
import { MutabaahActivitiesPage } from "./pages/MutabaahActivitiesPage";

const tabs = [
  { name: "Checklist Harian", href: "/mutabaah/checklist", icon: ClipboardCheck },
  { name: "Monitoring & Rapor", href: "/mutabaah/compliance", icon: Award },
  { name: "Katalog Amalan", href: "/mutabaah/activities", icon: BookCheck },
];

export const MutabaahRoutes: React.FC = () => {
  const location = useLocation();

  const isTabActive = (tabHref: string) => {
    return location.pathname.startsWith(tabHref);
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab.href);
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
        <Route index element={<Navigate to="checklist" replace />} />
        <Route path="checklist" element={<MutabaahDailyChecklistPage />} />
        <Route path="compliance" element={<MutabaahCompliancePage />} />
        <Route path="activities" element={<MutabaahActivitiesPage />} />
        <Route path="*" element={<Navigate to="checklist" replace />} />
      </Routes>
    </div>
  );
};
