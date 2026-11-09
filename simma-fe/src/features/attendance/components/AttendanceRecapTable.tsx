import React from "react";
import { Users, UserCheck, Calendar, ExternalLink } from "lucide-react";
import {
  STUDENT_STATUS_CONFIG,
  TEACHER_STATUS_CONFIG,
  type AttendanceStudent,
  type AttendanceTeacher,
} from "../types";

export interface AttendanceRecapTableProps {
  activeTab: "students" | "teachers";
  studentRecords: AttendanceStudent[];
  teacherRecords: AttendanceTeacher[];
  isLoadingStudent: boolean;
  isLoadingTeacher: boolean;
  classroomMap: Map<string, string>;
  teacherMap: Map<string, string>;
  onSelectStudentSummary: (student: { id: string; name?: string }) => void;
  onSelectTeacherSummary: (teacher: { id: string; name?: string }) => void;
}

export const AttendanceRecapTable: React.FC<AttendanceRecapTableProps> = ({
  activeTab,
  studentRecords,
  teacherRecords,
  isLoadingStudent,
  isLoadingTeacher,
  classroomMap,
  teacherMap,
  onSelectStudentSummary,
  onSelectTeacherSummary,
}) => {
  const formatDate = (d: string) => {
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(d));
    } catch {
      return d;
    }
  };

  if (activeTab === "students") {
    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-semibold text-slate-800">
              Riwayat Presensi Siswa ({studentRecords.length} rekaman)
            </h2>
          </div>
        </div>

        {isLoadingStudent ? (
          <div className="py-12 text-center text-xs text-slate-400">Memuat data rekap presensi...</div>
        ) : studentRecords.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Tidak ada rekaman presensi pada filter yang dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Tanggal</th>
                  <th className="px-4 py-2.5 font-medium">Siswa</th>
                  <th className="px-4 py-2.5 font-medium">Kelas / Rombel</th>
                  <th className="px-4 py-2.5 font-medium">Status Kehadiran</th>
                  <th className="px-4 py-2.5 font-medium">Keterangan</th>
                  <th className="px-4 py-2.5 font-medium">Pencatat / Guru</th>
                  <th className="px-4 py-2.5 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentRecords.map((item) => {
                  const statusCfg = STUDENT_STATUS_CONFIG[item.status] || {
                    label: item.status,
                    bgColor: "bg-slate-100",
                    textColor: "text-slate-600",
                    borderColor: "border-slate-200",
                  };
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-slate-800 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(item.date)}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-800">
                          {item.student?.fullName || item.studentId}
                        </div>
                        {item.student?.nisn && (
                          <div className="text-2xs text-slate-400">NISN: {item.student.nisn}</div>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {classroomMap.get(item.classroomId) || item.classroom?.name || item.classroomId}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold border ${statusCfg.colorClass.bg} ${statusCfg.colorClass.text} ${statusCfg.colorClass.border}`}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate">
                        {item.note || <span className="text-slate-300">-</span>}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {item.teacherId
                          ? teacherMap.get(item.teacherId) || item.teacher?.fullName || item.teacherId
                          : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            onSelectStudentSummary({
                              id: item.studentId,
                              name: item.student?.fullName,
                            })
                          }
                          className="inline-flex items-center gap-1 text-2xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Profil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-semibold text-slate-800">
            Riwayat Presensi Guru & GTK ({teacherRecords.length} rekaman)
          </h2>
        </div>
      </div>

      {isLoadingTeacher ? (
        <div className="py-12 text-center text-xs text-slate-400">Memuat data rekap guru...</div>
      ) : teacherRecords.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Tidak ada rekaman presensi pada filter yang dipilih.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 font-medium">Tanggal</th>
                <th className="px-4 py-2.5 font-medium">Nama Guru / Tenaga Kependidikan</th>
                <th className="px-4 py-2.5 font-medium">Status Kehadiran</th>
                <th className="px-4 py-2.5 font-medium">Keterangan</th>
                <th className="px-4 py-2.5 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teacherRecords.map((item) => {
                const statusCfg = TEACHER_STATUS_CONFIG[item.status] || {
                  label: item.status,
                  bgColor: "bg-slate-100",
                  textColor: "text-slate-600",
                  borderColor: "border-slate-200",
                };
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(item.date)}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-800">
                        {item.teacher?.fullName || teacherMap.get(item.teacherId) || item.teacherId}
                      </div>
                      {item.teacher?.nip && (
                        <div className="text-2xs text-slate-400">NIP: {item.teacher.nip}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold border ${statusCfg.colorClass.bg} ${statusCfg.colorClass.text} ${statusCfg.colorClass.border}`}
                      >
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 max-w-sm truncate">
                      {item.note || <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          onSelectTeacherSummary({
                            id: item.teacherId,
                            name: item.teacher?.fullName,
                          })
                        }
                        className="inline-flex items-center gap-1 text-2xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Profil
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
