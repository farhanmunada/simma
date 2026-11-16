import React from "react";
import { Check, Clock, X, ShieldAlert, HeartHandshake } from "lucide-react";
import type {
  MutabaahActivityDto,
  StudentDailyChecklistRowDto,
  MutabaahEntryStatus,
} from "../types";

interface ChecklistGridProps {
  activities: MutabaahActivityDto[];
  students: StudentDailyChecklistRowDto[];
  onToggleStatus: (studentId: string, activityId: string) => void;
  onOpenUzur: (student: StudentDailyChecklistRowDto) => void;
  onSetAllTerlaksanaForStudent: (studentId: string) => void;
}

const STATUS_ICONS: Record<MutabaahEntryStatus, React.ReactNode> = {
  terlaksana: <Check className="h-4 w-4 text-emerald-600" />,
  masbuk: <Clock className="h-4 w-4 text-amber-600" />,
  tidak_terlaksana: <X className="h-4 w-4 text-rose-600" />,
  uzur: <ShieldAlert className="h-4 w-4 text-purple-600" />,
};

const STATUS_COLORS: Record<MutabaahEntryStatus, string> = {
  terlaksana: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
  masbuk: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
  tidak_terlaksana: "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100",
  uzur: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
};

export const ChecklistGrid: React.FC<ChecklistGridProps> = ({
  activities,
  students,
  onToggleStatus,
  onOpenUzur,
  onSetAllTerlaksanaForStudent,
}) => {
  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
        Tidak ada data santri ditemukan untuk kelas/asrama ini.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
        <thead className="bg-slate-50 font-semibold text-slate-700">
          <tr>
            <th className="sticky left-0 z-20 bg-slate-50 px-4 py-3 min-w-[200px] border-r border-slate-200">
              Nama Santri
            </th>
            <th className="px-3 py-3 text-center min-w-[100px] border-r border-slate-200">
              Status Khusus
            </th>
            {activities.map((act) => (
              <th
                key={act.id}
                className="px-2 py-3 text-center min-w-[90px] border-r border-slate-100"
                title={`${act.name} (${act.category}, Bobot: ${act.weight})`}
              >
                <div className="truncate font-bold text-slate-800">{act.name}</div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider">
                  {act.category} • B:{act.weight}
                </div>
              </th>
            ))}
            <th className="px-3 py-3 text-center min-w-[120px]">Aksi Cepat</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {students.map((student) => {
            const entryMap = new Map(student.entries.map((e) => [e.activityId, e]));

            return (
              <tr key={student.studentId} className="hover:bg-slate-50/70 transition">
                <td className="sticky left-0 z-10 bg-white px-4 py-2.5 font-medium text-slate-900 border-r border-slate-200">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate">{student.studentName}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        student.gender === "P"
                          ? "bg-pink-100 text-pink-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {student.gender === "P" ? "Akhwat" : "Ikhwan"}
                    </span>
                  </div>
                  {student.className && (
                    <div className="text-[10px] text-slate-600">{student.className}</div>
                  )}
                </td>

                <td className="px-2 py-2 text-center border-r border-slate-200">
                  {student.isUzur ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                      <ShieldAlert className="h-3 w-3" />
                      Uzur Syar&apos;i
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenUzur(student)}
                      className="rounded border border-slate-200 px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    >
                      + Uzur
                    </button>
                  )}
                </td>

                {activities.map((act) => {
                  const entry = entryMap.get(act.id);
                  const status: MutabaahEntryStatus = entry?.status || (student.isUzur ? "uzur" : "terlaksana");

                  return (
                    <td
                      key={act.id}
                      className="px-1.5 py-1.5 text-center border-r border-slate-100"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleStatus(student.studentId, act.id)}
                        className={`inline-flex items-center justify-center w-full rounded-md border px-1.5 py-1 text-xs font-semibold transition ${STATUS_COLORS[status]}`}
                        title={`Status: ${status}. Klik untuk ganti.`}
                      >
                        {STATUS_ICONS[status]}
                        <span className="ml-1 text-[11px] capitalize">
                          {status === "tidak_terlaksana" ? "Lalai" : status}
                        </span>
                      </button>
                    </td>
                  );
                })}

                <td className="px-2 py-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSetAllTerlaksanaForStudent(student.studentId)}
                      className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      title="Set semua amalan santri ini Terlaksana"
                    >
                      Semua ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenUzur(student)}
                      className="rounded bg-slate-50 p-1 text-slate-500 hover:bg-slate-100"
                      title="Catat Uzur Syar'i"
                    >
                      <HeartHandshake className="h-3.5 w-3.5 text-purple-600" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
