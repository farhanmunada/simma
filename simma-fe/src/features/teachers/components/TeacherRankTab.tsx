import React, { useState } from "react";
import { Plus, Trash2, Award } from "lucide-react";
import { GRADE_GROUPS, TEACHER_RANKS } from "@simma/shared";
import type { TeacherRankDto } from "../types";
import { useAddRank, useDeleteRank } from "../api/teachers.api";

interface TeacherRankTabProps {
  teacherId: string;
  ranks: TeacherRankDto[];
}

export const TeacherRankTab: React.FC<TeacherRankTabProps> = ({ teacherId, ranks }) => {
  const addRank = useAddRank(teacherId);
  const delRank = useDeleteRank(teacherId);

  const [rankName, setRankName] = useState<string>(TEACHER_RANKS[4] || "Penata Muda");
  const [rankGroup, setRankGroup] = useState<string>("III/a");
  const [rankSk, setRankSk] = useState("");
  const [rankDate, setRankDate] = useState("");
  const [rankTmt, setRankTmt] = useState("");

  const handleCreateRank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rankSk.trim() || !rankTmt) return;
    await addRank.mutateAsync({
      rank: rankName,
      gradeGroup: rankGroup as any,
      skNumber: rankSk.trim(),
      skDate: rankDate || rankTmt,
      tmtRank: rankTmt,
      isCurrent: true,
    });
    setRankSk("");
    setRankDate("");
    setRankTmt("");
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleCreateRank}
        className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex flex-wrap gap-2 items-center text-sm"
      >
        <select
          value={rankGroup}
          onChange={(e) => setRankGroup(e.target.value)}
          className="px-2 py-1.5 border rounded bg-white text-xs"
        >
          {GRADE_GROUPS.map((g) => (
            <option key={g} value={g}>
              Gol. {g}
            </option>
          ))}
        </select>
        <select
          value={rankName}
          onChange={(e) => setRankName(e.target.value)}
          className="px-2 py-1.5 border rounded bg-white text-xs flex-1 min-w-[140px]"
        >
          {TEACHER_RANKS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Nomor SK Pangkat"
          value={rankSk}
          onChange={(e) => setRankSk(e.target.value)}
          className="px-2 py-1.5 border rounded text-xs flex-1 min-w-[120px]"
          required
        />
        <input
          type="date"
          title="TMT Pangkat"
          value={rankTmt}
          onChange={(e) => setRankTmt(e.target.value)}
          className="px-2 py-1.5 border rounded text-xs"
          required
        />
        <button
          type="submit"
          disabled={addRank.isPending}
          className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-medium flex items-center gap-1 hover:bg-purple-700 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah Pangkat
        </button>
      </form>

      <div className="divide-y divide-gray-100">
        {ranks.map((rk) => (
          <div key={rk.id} className="py-2.5 flex items-center justify-between text-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">
                  {rk.gradeGroup} - {rk.rank}
                </span>
                {rk.isCurrent && (
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                    Pangkat Aktif
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                SK: {rk.skNumber} • TMT: {rk.tmtRank} • KGB Berikutnya: {rk.nextKgbDate || "-"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => delRank.mutate(rk.id)}
              disabled={delRank.isPending}
              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
              title="Hapus riwayat pangkat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {ranks.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <Award className="w-8 h-8 mx-auto mb-1 text-gray-300" />
            <p className="text-xs">Belum ada riwayat kepangkatan terdata untuk guru ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};
