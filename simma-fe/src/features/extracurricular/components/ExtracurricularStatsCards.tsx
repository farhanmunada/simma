import React from "react";
import { Award, Users, FileCheck2, Compass } from "lucide-react";
import type { ExtracurricularStats } from "../types";

interface Props {
  stats?: ExtracurricularStats;
  isLoading: boolean;
}

export const ExtracurricularStatsCards: React.FC<Props> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Ekstrakurikuler",
      value: stats?.totalExtracurriculars ?? 0,
      icon: Award,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Anggota Siswa Aktif",
      value: stats?.totalMembers ?? 0,
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Nilai RDM Terekam",
      value: stats?.totalGrades ?? 0,
      icon: FileCheck2,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      title: "Kategori Terdaftar",
      value: Object.keys(stats?.categoryDistribution ?? {}).length,
      icon: Compass,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs"
          >
            <div className={`p-3 rounded-lg border ${card.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{card.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};
