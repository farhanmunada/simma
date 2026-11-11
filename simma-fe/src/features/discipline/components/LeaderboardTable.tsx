import React, { useState } from "react";
import { SanctionBadge } from "./SanctionBadge";
import type { StudentDisciplineSummaryItem } from "../types";

interface LeaderboardTableProps {
  data: StudentDisciplineSummaryItem[];
  isLoading: boolean;
  onSelectStudent?: (studentId: string) => void;
  activeType: "points_highest" | "merits_highest";
  onTypeChange: (type: "points_highest" | "merits_highest") => void;
}

export function LeaderboardTable({
  data,
  isLoading,
  onSelectStudent,
  activeType,
  onTypeChange,
}: LeaderboardTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            {activeType === "points_highest"
              ? "Peringkat Disiplin - Santri Perlu Pembinaan"
              : "Peringkat Disiplin - Santri Berprestasi (Teladan)"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeType === "points_highest"
              ? "Urutan santri berdasarkan poin kumulatif bersih tertinggi yang mendekati atau melampaui sanksi"
              : "Urutan santri berdasarkan akumulasi prestasi dan apresiasi positif"}
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => onTypeChange("points_highest")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeType === "points_highest"
                ? "bg-white text-rose-600 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Poin Pelanggaran
          </button>
          <button
            type="button"
            onClick={() => onTypeChange("merits_highest")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeType === "merits_highest"
                ? "bg-white text-emerald-600 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Apresiasi / Teladan
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3 w-12 text-center">Rank</th>
              <th className="px-4 py-3">Nama Siswa</th>
              <th className="px-4 py-3">NISN / NIS</th>
              <th className="px-4 py-3">Kelas</th>
              <th className="px-4 py-3 text-center">Pelanggaran</th>
              <th className="px-4 py-3 text-center">Apresiasi</th>
              <th className="px-4 py-3 text-center">Poin Net</th>
              <th className="px-4 py-3 text-center">Status Sanksi</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  Memuat data peringkat kedisiplinan...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  Belum ada data kedisiplinan yang tercatat.
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={item.studentId} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3 text-center font-bold text-slate-700">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.studentName}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                    {item.nisn || item.nis || "-"}
                  </td>
                  <td className="px-4 py-3">{item.className || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold text-rose-600">+{item.infractionPoints}</span>
                    <span className="text-[10px] text-slate-400 block">({item.totalInfractions} kali)</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold text-emerald-600">+{item.rewardPoints}</span>
                    <span className="text-[10px] text-slate-400 block">({item.totalRewards} kali)</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-sm font-bold ${
                        item.netPoints >= 50
                          ? "text-rose-600"
                          : item.netPoints >= 25
                          ? "text-amber-600"
                          : "text-slate-700"
                      }`}
                    >
                      {item.netPoints}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <SanctionBadge level={item.sanctionLevel} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {onSelectStudent && (
                      <button
                        type="button"
                        onClick={() => onSelectStudent(item.studentId)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline"
                      >
                        Detail Buku Saku
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
