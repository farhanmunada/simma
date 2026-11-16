import React from "react";
import { ArrowDownLeft, ArrowUpRight, Clock, ShieldCheck, GraduationCap } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import type { TransferStatsData } from "../types";

interface TransferStatsCardsProps {
  stats?: TransferStatsData;
  isLoading?: boolean;
}

export const TransferStatsCards: React.FC<TransferStatsCardsProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      label: "Mutasi Masuk",
      value: stats?.totalIn ?? 0,
      icon: ArrowDownLeft,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Mutasi Keluar",
      value: stats?.totalOut ?? 0,
      icon: ArrowUpRight,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      label: "Pending Clearance",
      value: stats?.pendingClearance ?? 0,
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      label: "Menunggu Persetujuan",
      value: stats?.pendingApproval ?? 0,
      icon: ShieldCheck,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      label: "Lulus Tahun Ini",
      value: stats?.graduatedThisYear ?? 0,
      icon: GraduationCap,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card key={i} className="p-4 flex items-center justify-between border">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{c.label}</p>
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
