import React from "react";
import { Users, Award, Clock, Briefcase } from "lucide-react";
import type { GtkStatsDto } from "../types";

interface TeacherStatsCardsProps {
  stats?: GtkStatsDto;
  isLoading?: boolean;
}

export const TeacherStatsCards: React.FC<TeacherStatsCardsProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total GTK Madrasah",
      value: stats.totalGtk,
      subtext: `${stats.totalPendidik} Guru | ${stats.totalTenagaKependidikan} Tendik`,
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      title: "Status Kepegawaian",
      value: `${stats.pnsCount + stats.pppkCount} ASN`,
      subtext: `${stats.gtyCount} GTY | ${stats.gttCount} GTT | ${stats.pttCount} PTT`,
      icon: Briefcase,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Sertifikasi Guru",
      value: `${stats.certifiedCount} Guru`,
      subtext: `${stats.eligibleTpgCount} Memenuhi Syarat TPG (24 JTM)`,
      icon: Award,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      title: "Rata-Rata Beban Jam",
      value: `${stats.averageJtm} JTM`,
      subtext: "Standar Simpatika: Min. 24 JTM/Minggu",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {c.title}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{c.value}</h3>
              <p className="text-xs text-gray-500 mt-1.5">{c.subtext}</p>
            </div>
            <div className={`p-2.5 rounded-lg border ${c.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
