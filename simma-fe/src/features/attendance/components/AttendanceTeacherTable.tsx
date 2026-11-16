import React from "react";
import { Users } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import {
  TEACHER_STATUS_CONFIG,
  type TeacherAttendanceStatus,
} from "../types";

export interface TeacherAttendanceRow {
  teacherId: string;
  fullName: string;
  nuptk?: string;
  nik?: string;
  employmentType?: string;
  status: TeacherAttendanceStatus;
  note: string;
}

export interface AttendanceTeacherTableProps {
  attendanceRows: TeacherAttendanceRow[];
  isLoadingData: boolean;
  onStatusChange: (teacherId: string, status: TeacherAttendanceStatus) => void;
  onNoteChange: (teacherId: string, note: string) => void;
}

export const AttendanceTeacherTable: React.FC<AttendanceTeacherTableProps> = ({
  attendanceRows,
  isLoadingData,
  onStatusChange,
  onNoteChange,
}) => {
  return (
    <Card>
      <div className="overflow-x-auto -mx-4 -my-4">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="py-2.5 px-3 font-semibold text-slate-700 w-10 text-center">No</th>
              <th className="py-2.5 px-3 font-semibold text-slate-700 w-32">NUPTK / NIK</th>
              <th className="py-2.5 px-3 font-semibold text-slate-700 min-w-44">Nama Guru / GTK</th>
              <th className="py-2.5 px-3 font-semibold text-slate-700 w-24 text-center">
                Status Pegawai
              </th>
              <th className="py-2.5 px-3 font-semibold text-slate-700 w-64 text-center">
                Status Presensi
              </th>
              <th className="py-2.5 px-3 font-semibold text-slate-700 min-w-48">
                Keterangan / Catatan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoadingData ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Memuat data guru dan presensi...
                </td>
              </tr>
            ) : attendanceRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  Belum ada data guru/GTK yang terdaftar.
                </td>
              </tr>
            ) : (
              attendanceRows.map((row, idx) => (
                <tr key={row.teacherId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                    {row.nuptk || row.nik}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-900">{row.fullName}</td>
                  <td className="py-2 px-3 text-center">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {row.employmentType}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-center space-x-1">
                      {(
                        ["hadir", "izin", "sakit", "alpa", "dinas_luar"] as TeacherAttendanceStatus[]
                      ).map((statusKey) => {
                        const config = TEACHER_STATUS_CONFIG[statusKey];
                        const isSelected = row.status === statusKey;
                        return (
                          <button
                            key={statusKey}
                            type="button"
                            onClick={() => onStatusChange(row.teacherId, statusKey)}
                            className={`px-2 py-1 rounded text-xs font-semibold border transition-all ${
                              isSelected
                                ? `${config.colorClass.activeBg} ${config.colorClass.activeText} ${config.colorClass.activeBorder} shadow-xs`
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                            title={config.label}
                          >
                            {config.short}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={row.note}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onNoteChange(row.teacherId, e.target.value)
                      }
                      placeholder="Catatan..."
                      className="w-full text-xs px-2 py-1 border border-slate-200 rounded focus:border-emerald-600 focus:outline-none"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
