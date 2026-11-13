import React from "react";
import { Link } from "react-router";
import { Users, GraduationCap, School, Building2 } from "lucide-react";
import type { EmisReadinessSummary } from "../types";

interface AuditReadinessCardProps {
  summary: EmisReadinessSummary;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const AuditReadinessCard: React.FC<AuditReadinessCardProps> = ({
  summary,
  onRefresh,
  isLoading,
}) => {
  const getBadgeColor = (pct: number) => {
    if (pct >= 95) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (pct >= 80) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-rose-100 text-rose-800 border-rose-300";
  };

  const entities = [
    { name: "Siswa Aktif", data: summary.students, Icon: GraduationCap },
    { name: "GTK & Guru", data: summary.teachers, Icon: Users },
    { name: "Rombongan Belajar", data: summary.classrooms, Icon: School },
    { name: "Profil Madrasah", data: summary.institution, Icon: Building2 },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">
              Audit Kelayakan Data EMIS 4.0
            </h2>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(
                summary.overallPercentage
              )}`}
            >
              {summary.isReadyForExport
                ? "✓ Siap Ekspor Kemenag"
                : "! Perlu Perbaikan Data"}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Validasi standar NIK Dukcapil, NISN aktif, nama ibu kandung, dan kelengkapan rombel.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-black text-gray-900">
              {summary.overallPercentage}%
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Skor Kesiapan
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Mengaudit..." : "Audit Ulang"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {entities.map((item) => (
          <div
            key={item.name}
            className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <item.Icon className="h-5 w-5" />
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  item.data.percentage >= 95
                    ? "bg-emerald-100 text-emerald-700"
                    : item.data.percentage >= 80
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {item.data.percentage}%
              </span>
            </div>
            <div className="text-sm font-semibold text-gray-800">
              {item.name}
            </div>
            <div className="text-xs text-gray-500 mt-1 flex justify-between">
              <span>Valid: {item.data.valid ?? (item.data as any).ready ?? 0}</span>
              <span className="text-rose-600 font-medium">
                Anomali: {item.data.invalid ?? 0}
              </span>
            </div>
            {item.name === "Profil Lembaga" && (
              <Link
                to="/settings/profile"
                className="text-[11px] text-emerald-600 hover:text-emerald-700 hover:underline mt-2 inline-flex items-center font-medium"
              >
                Perbarui Profil &rarr;
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
