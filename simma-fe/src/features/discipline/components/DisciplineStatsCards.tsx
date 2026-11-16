import React from "react";
import { AlertTriangle, Award, Users, FileText } from "lucide-react";
import { Card } from "../../../components/ui/Card";

interface StatsProps {
  studentsAtRiskCount: number;
  totalInfractionsCount: number;
  totalRewardsCount: number;
  activeSummonsCount: number;
}

export function DisciplineStatsCards({
  studentsAtRiskCount,
  totalInfractionsCount,
  totalRewardsCount,
  activeSummonsCount,
}: StatsProps) {
  const stats = [
    {
      title: "Santri Perlu Pembinaan (SP)",
      value: studentsAtRiskCount,
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      description: "Santri dengan poin >= 25 (SP 1-3)",
    },
    {
      title: "Total Pelanggaran",
      value: totalInfractionsCount,
      icon: Users,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      description: "Catatan pelanggaran tercatat",
    },
    {
      title: "Total Apresiasi / Prestasi",
      value: totalRewardsCount,
      icon: Award,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      description: "Poin apresiasi santri teladan",
    },
    {
      title: "Surat Panggilan Terbit",
      value: activeSummonsCount,
      icon: FileText,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description: "Pemanggilan orang tua aktif",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="p-4 border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.title}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{item.value}</h3>
              <p className="text-xs text-slate-400 mt-1">{item.description}</p>
            </div>
            <div className={`p-3 rounded-xl border ${item.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
