import React from "react";
import { Trash2, Edit2, AlertTriangle } from "lucide-react";
import type { TasmiExam } from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";

export interface TasmiExamTableProps {
  exams: TasmiExam[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onEdit: (exam: TasmiExam) => void;
  onDelete: (id: string) => void;
  deletingId?: string | null;
}

export const TasmiExamTable: React.FC<TasmiExamTableProps> = ({
  exams,
  isLoading,
  isError,
  error,
  onEdit,
  onDelete,
  deletingId,
}) => {
  return (
    <Card className="p-0 overflow-hidden">
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Memuat data ujian Tasmi'...</div>
      ) : isError ? (
        <div className="p-6 text-center text-xs text-red-600 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{(error as Error)?.message || "Gagal memuat data ujian Tasmi'."}</span>
        </div>
      ) : exams.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">
          Belum ada rekam data ujian Tasmi'.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">Tanggal Ujian</th>
                <th className="py-2.5 px-3">Siswa ID</th>
                <th className="py-2.5 px-3 text-center">Juz</th>
                <th className="py-2.5 px-3 text-center">Skor (T / M / K)</th>
                <th className="py-2.5 px-3 text-center">Nilai Akhir</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Catatan Penguji</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-xs">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                    {item.examDate}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-xs">
                    {item.studentId.slice(0, 8)}...
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                    Juz {item.juz}
                  </td>
                  <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-700">
                    <span title="Tajwid">{item.tajwidScore}</span> /{" "}
                    <span title="Makhroj">{item.makhrojScore}</span> /{" "}
                    <span title="Kelancaran">{item.fluencyScore}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-sm font-mono text-slate-900">
                    {item.finalScore}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.status === "lulus" ? (
                      <Badge variant="success" size="sm">
                        Lulus
                      </Badge>
                    ) : item.status === "perlu_perbaikan" ? (
                      <Badge variant="warning" size="sm">
                        Perlu Perbaikan
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="sm">
                        Tidak Lulus
                      </Badge>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-500 max-w-xs truncate">
                    {item.notes || "-"}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title="Edit Ujian"
                        onClick={() => onEdit(item)}
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                        title="Hapus Ujian"
                        onClick={() => onDelete(item.id)}
                        isLoading={deletingId === item.id}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
