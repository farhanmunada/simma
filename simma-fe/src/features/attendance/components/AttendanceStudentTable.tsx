import React from "react";
import { Users } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import {
  STUDENT_STATUS_CONFIG,
  type StudentAttendanceStatus,
} from "../types";

export interface StudentAttendanceRow {
  studentId: string;
  studentName: string;
  nisn?: string;
  nis?: string;
  gender?: string;
  status: StudentAttendanceStatus;
  note: string;
}

export interface AttendanceStudentTableProps {
  attendanceRows: StudentAttendanceRow[];
  isLoadingData: boolean;
  onStatusChange: (studentId: string, status: StudentAttendanceStatus) => void;
  onNoteChange: (studentId: string, note: string) => void;
}

export const AttendanceStudentTable: React.FC<AttendanceStudentTableProps> = ({
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
              <th className="py-2.5 px-3 font-semibold text-slate-700 w-32">NISN / NIS</th>
              <th className="py-2.5 px-3 font-semibold text-slate-700 min-w-44">Nama Siswa</th>
              <th className="py-2.5 px-3 font-semibold text-slate-700 w-14 text-center">L/P</th>
              <th className="py-2.5 px-3 font-semibold text-slate-700 w-56 text-center">
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
                  Memuat data siswa dan presensi...
                </td>
              </tr>
            ) : attendanceRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  Belum ada data siswa di kelas yang dipilih.
                </td>
              </tr>
            ) : (
              attendanceRows.map((row, idx) => (
                <tr key={row.studentId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                    {row.nisn || row.nis || "-"}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-900">{row.studentName}</td>
                  <td className="py-2 px-3 text-center text-slate-600">{row.gender}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-center space-x-1">
                      {(["hadir", "izin", "sakit", "alpa"] as StudentAttendanceStatus[]).map(
                        (statusKey) => {
                          const config = STUDENT_STATUS_CONFIG[statusKey];
                          const isSelected = row.status === statusKey;
                          return (
                            <button
                              key={statusKey}
                              type="button"
                              onClick={() => onStatusChange(row.studentId, statusKey)}
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
                        }
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={row.note}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onNoteChange(row.studentId, e.target.value)
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
