import React from "react";
import { NavLink, Outlet } from "react-router";
import { BookOpen, Award } from "lucide-react";

export const GradesLayout: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6" aria-label="Tabs">
          <NavLink
            to="/grades"
            end
            className={({ isActive }) =>
              `inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`
            }
          >
            <BookOpen className="w-4 h-4" />
            <span>Rencana Penilaian & Input Nilai</span>
          </NavLink>

          <NavLink
            to="/grades/semester"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`
            }
          >
            <Award className="w-4 h-4" />
            <span>Rekap Nilai Semester</span>
          </NavLink>
        </nav>
      </div>

      {/* Main Feature Content */}
      <Outlet />
    </div>
  );
};
