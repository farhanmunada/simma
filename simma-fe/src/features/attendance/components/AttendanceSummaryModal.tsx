import React from "react";
import { X, Calendar } from "lucide-react";
import { useStudentSummary, useTeacherSummary } from "../api/attendance.api";

export interface AttendanceSummaryModalProps {
  selectedStudent: { id: string; name?: string } | null;
  onCloseStudent: () => void;
  selectedTeacher: { id: string; name?: string } | null;
  onCloseTeacher: () => void;
  startDate: string;
  endDate: string;
}

export const AttendanceSummaryModal: React.FC<AttendanceSummaryModalProps> = ({
  selectedStudent,
  onCloseStudent,
  selectedTeacher,
  onCloseTeacher,
  startDate,
  endDate,
}) => {
  const { data: studentSummary, isLoading: isStudentLoading } = useStudentSummary(
    selectedStudent?.id || "",
    { startDate, endDate }
  );

  const { data: teacherSummary, isLoading: isTeacherLoading } = useTeacherSummary(
    selectedTeacher?.id || "",
    { startDate, endDate }
  );

  if (selectedStudent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Statistik Kehadiran Siswa
              </h3>
              <p className="text-2xs text-slate-500">
                {selectedStudent.name || selectedStudent.id}
              </p>
            </div>
            <button
              type="button"
              onClick={onCloseStudent}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-2xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Periode: {startDate} s/d {endDate}</span>
            </div>
            {isStudentLoading ? (
              <div className="py-6 text-center text-xs text-slate-400">Memuat profil kehadiran...</div>
            ) : studentSummary ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
                    <span className="text-2xs font-semibold text-emerald-800">Hadir</span>
                    <p className="text-base font-bold text-emerald-700">{studentSummary.hadir}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded p-2">
                    <span className="text-2xs font-semibold text-amber-800">Sakit</span>
                    <p className="text-base font-bold text-amber-700">{studentSummary.sakit}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <span className="text-2xs font-semibold text-blue-800">Izin</span>
                    <p className="text-base font-bold text-blue-700">{studentSummary.izin}</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded p-2">
                    <span className="text-2xs font-semibold text-rose-800">Alpa</span>
                    <p className="text-base font-bold text-rose-700">{studentSummary.alpa}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-600">Total Hari & % Kehadiran:</span>
                  <span className="font-bold text-emerald-700">
                    {studentSummary.total} Hari ({studentSummary.attendancePercentage ?? studentSummary.percentage}%)
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">Data ringkasan tidak ditemukan.</div>
            )}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onCloseStudent}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 border border-slate-200 rounded font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedTeacher) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Statistik Kehadiran Guru / GTK
              </h3>
              <p className="text-2xs text-slate-500">
                {selectedTeacher.name || selectedTeacher.id}
              </p>
            </div>
            <button
              type="button"
              onClick={onCloseTeacher}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-2xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Periode: {startDate} s/d {endDate}</span>
            </div>
            {isTeacherLoading ? (
              <div className="py-6 text-center text-xs text-slate-400">Memuat profil kehadiran GTK...</div>
            ) : teacherSummary ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
                    <span className="text-2xs font-semibold text-emerald-800">Hadir</span>
                    <p className="text-base font-bold text-emerald-700">{teacherSummary.hadir}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded p-2">
                    <span className="text-2xs font-semibold text-purple-800">Dinas Luar</span>
                    <p className="text-base font-bold text-purple-700">{teacherSummary.dinasLuar}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded p-2">
                    <span className="text-2xs font-semibold text-amber-800">Sakit</span>
                    <p className="text-base font-bold text-amber-700">{teacherSummary.sakit}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <span className="text-2xs font-semibold text-blue-800">Izin</span>
                    <p className="text-base font-bold text-blue-700">{teacherSummary.izin}</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded p-2">
                    <span className="text-2xs font-semibold text-rose-800">Alpa</span>
                    <p className="text-base font-bold text-rose-700">{teacherSummary.alpa}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded p-2">
                    <span className="text-2xs font-semibold text-slate-800">Total</span>
                    <p className="text-base font-bold text-slate-700">{teacherSummary.total}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-600">Simpatika / Kehadiran JTM:</span>
                  <span className="font-bold text-emerald-700">{teacherSummary.attendancePercentage ?? teacherSummary.percentage}%</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">Data ringkasan tidak ditemukan.</div>
            )}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onCloseTeacher}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 border border-slate-200 rounded font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
