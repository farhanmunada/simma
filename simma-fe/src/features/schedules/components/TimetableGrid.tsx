import React from "react";
import { Plus, Trash2, Edit3, BookOpen, Clock } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import type { ScheduleMatrixView, ScheduleViewType } from "../types";
import { DAY_OF_WEEKS, type DayOfWeek } from "@simma/shared";

const DAY_LABELS: Record<DayOfWeek, string> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
  ahad: "Ahad",
};

interface TimetableGridProps {
  matrix: ScheduleMatrixView | undefined;
  isLoading: boolean;
  viewType: ScheduleViewType;
  onSlotClick: (day: DayOfWeek, slotId: string) => void;
  onEditSchedule: (scheduleId: string) => void;
  onDeleteSchedule: (scheduleId: string) => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  matrix,
  isLoading,
  viewType,
  onSlotClick,
  onEditSchedule,
  onDeleteSchedule,
}) => {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="h-4 w-4 animate-spin" />
          <span>Memuat matriks jadwal pelajaran...</span>
        </div>
      </div>
    );
  }

  if (!matrix || matrix.rows.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
        <BookOpen className="h-8 w-8 text-slate-400" />
        <p className="mt-2 text-sm font-medium text-slate-700">Belum Ada Jadwal / Slot Waktu</p>
        <p className="text-xs text-slate-500">Pilih target kelas/guru/ruangan atau konfigurasikan jam pelajaran terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75">
            <th className="sticky left-0 z-10 w-28 bg-slate-50 px-3 py-3 font-semibold text-slate-700">
              Jam / Waktu
            </th>
            {DAY_OF_WEEKS.map((day) => (
              <th key={day} className="min-w-36 px-3 py-3 font-semibold text-slate-700 uppercase tracking-wider">
                {DAY_LABELS[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {matrix.rows.map((row) => {
            const isBreak = !row.timeSlot.isTeachingTime;

            return (
              <tr key={row.timeSlot.id} className={isBreak ? "bg-amber-50/30" : "hover:bg-slate-50/40"}>
                <td className="sticky left-0 z-10 border-r border-slate-200 bg-slate-50/90 px-3 py-2">
                  <div className="font-semibold text-slate-900">{row.timeSlot.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {row.timeSlot.startTime} - {row.timeSlot.endTime}
                  </div>
                  <span className="mt-1 inline-block rounded text-[10px] uppercase font-bold text-slate-400">
                    {row.timeSlot.sessionType}
                  </span>
                </td>

                {isBreak ? (
                  <td colSpan={DAY_OF_WEEKS.length} className="px-3 py-2 text-center text-xs font-medium text-amber-800">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-3 py-1">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      <span>{row.timeSlot.name} ({row.timeSlot.startTime} - {row.timeSlot.endTime})</span>
                    </div>
                  </td>
                ) : (
                  DAY_OF_WEEKS.map((day) => {
                    const cell = row.cells[day];

                    if (!cell || !cell.scheduleId) {
                      return (
                        <td key={day} className="border-r border-slate-100 p-1.5 align-top">
                          <button
                            type="button"
                            onClick={() => onSlotClick(day, row.timeSlot.id)}
                            className="group flex h-20 w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 transition hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-emerald-700"
                          >
                            <Plus className="h-4 w-4 transition group-hover:scale-110" />
                            <span className="mt-0.5 text-[10px]">Plot</span>
                          </button>
                        </td>
                      );
                    }

                    const isDiniyah = cell.sessionType === "diniyah";

                    return (
                      <td key={day} className="border-r border-slate-100 p-1.5 align-top">
                        <div
                          className={`relative flex h-20 flex-col justify-between rounded-lg border p-2 shadow-xs transition hover:shadow-md ${
                            isDiniyah
                              ? "border-teal-200 bg-teal-50/40"
                              : "border-blue-200 bg-blue-50/40"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-slate-900 line-clamp-1">
                                {cell.subjectName}
                              </span>
                              <Badge
                                variant={isDiniyah ? "success" : "info"}
                                size="sm"
                                className="text-[9px] uppercase px-1 py-0"
                              >
                                {isDiniyah ? "Diniyah" : "Formal"}
                              </Badge>
                            </div>

                            <p className="mt-0.5 text-[11px] text-slate-600 line-clamp-1">
                              {viewType === "teacher"
                                ? cell.classroomName
                                : cell.teacherName}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-500">
                            <span className="truncate">{cell.roomName || "-"}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                title="Edit Jadwal"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditSchedule(cell.scheduleId!);
                                }}
                                className="rounded p-0.5 text-slate-400 hover:bg-white hover:text-slate-700"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                title="Hapus Jadwal"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteSchedule(cell.scheduleId!);
                                }}
                                className="rounded p-0.5 text-slate-400 hover:bg-white hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
