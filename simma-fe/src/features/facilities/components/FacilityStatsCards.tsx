import React from "react";
import {
  Package,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import type { FacilityStats } from "../types";

interface FacilityStatsCardsProps {
  stats?: FacilityStats;
  isLoading?: boolean;
}

export const FacilityStatsCards: React.FC<FacilityStatsCardsProps> = ({
  stats,
  isLoading,
}) => {
  const cards = [
    {
      label: "Total Aset",
      value: stats?.totalAssets ?? 0,
      icon: Package,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      label: "Tersedia",
      value: stats?.availableAssets ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Sedang Dipinjam",
      value: stats?.borrowedAssets ?? 0,
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      label: "Dalam Perbaikan",
      value: stats?.underRepairAssets ?? 0,
      icon: Wrench,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      label: "Kondisi Rusak",
      value: stats?.damagedAssets ?? 0,
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card key={i} className="p-4 flex items-center justify-between border">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {c.label}
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {isLoading ? "..." : c.value}
              </h3>
            </div>
            <div className={`p-3 rounded-xl border ${c.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
