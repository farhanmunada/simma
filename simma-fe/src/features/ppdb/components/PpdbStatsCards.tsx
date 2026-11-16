import React from "react";
import { Users, Clock, FileCheck, CheckCircle, Sparkles } from "lucide-react";
import type { PpdbStats } from "../types";

interface PpdbStatsCardsProps {
  stats?: PpdbStats;
}

export const PpdbStatsCards: React.FC<PpdbStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div className="bg-white p-3.5 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 text-xs">
          <span>Total Pendaftar</span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <p className="text-xl font-bold text-slate-800 mt-1">{stats?.total || 0}</p>
      </div>

      <div className="bg-white p-3.5 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 text-xs">
          <span>Menunggu</span>
          <Clock className="w-4 h-4 text-sky-500" />
        </div>
        <p className="text-xl font-bold text-sky-600 mt-1">{stats?.submitted || 0}</p>
      </div>

      <div className="bg-white p-3.5 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 text-xs">
          <span>Terverifikasi</span>
          <FileCheck className="w-4 h-4 text-indigo-500" />
        </div>
        <p className="text-xl font-bold text-indigo-600 mt-1">{stats?.verified || 0}</p>
      </div>

      <div className="bg-white p-3.5 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 text-xs">
          <span>Diterima</span>
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        </div>
        <p className="text-xl font-bold text-emerald-600 mt-1">{stats?.accepted || 0}</p>
      </div>

      <div className="bg-white p-3.5 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-slate-500 text-xs">
          <span>Buku Induk</span>
          <Sparkles className="w-4 h-4 text-purple-500" />
        </div>
        <p className="text-xl font-bold text-purple-600 mt-1">{stats?.enrolled || 0}</p>
      </div>
    </div>
  );
};
