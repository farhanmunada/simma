import React from "react";
import { AlertTriangle, Edit2, Trash2 } from "lucide-react";
import type { TahfidzRecord } from "../types";
import { getSurahName } from "../utils";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";

export interface TahfidzLogTableProps {
  records: TahfidzRecord[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onEdit: (record: TahfidzRecord) => void;
  onDelete: (id: string) => void;
  deletingId?: string | null;
}

export const TahfidzLogTable: React.FC<TahfidzLogTableProps> = ({
  records,
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
        <div className="p-8 text-center text-xs text-slate-500">Memuat riwayat setoran...</div>
      ) : isError ? (
        <div className="p-6 text-center text-xs text-red-600 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{(error as Error)?.message || "Gagal memuat riwayat setoran."}</span>
        </div>
      ) : records.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">
          Belum ada catatan setoran hafalan yang cocok dengan filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Siswa ID</th>
                <th className="py-2.5 px-3 text-center">Tipe</th>
                <th className="py-2.5 px-3">Capaian Ayat</th>
                <th className="py-2.5 px-3 text-center">Nilai (T / M / K)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Catatan</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-xs">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-xs">
                    {item.studentId.slice(0, 8)}...
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.type === "Z" ? (
                      <Badge variant="success" size="sm">
                        Ziyadah
                      </Badge>
                    ) : (
                      <Badge variant="info" size="sm">
                        Muraja'ah
                      </Badge>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-800">
                    <div className="font-medium text-xs">
                      Juz {item.juz} • {getSurahName(item.surah)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Ayat {item.ayahStart} - {item.ayahEnd}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-700">
                    <span title="Tajwid">{item.tajwidScore}</span> /{" "}
                    <span title="Makhroj">{item.makhrojScore}</span> /{" "}
                    <span title="Kelancaran">{item.fluencyScore}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.status === "lulus" ? (
                      <Badge variant="success" size="sm">
                        Lulus
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        Perlu Perbaikan
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
                        title="Edit Catatan"
                        onClick={() => onEdit(item)}
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                        title="Hapus Catatan"
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
