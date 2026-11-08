import React, { useState, useEffect, useMemo } from "react";
import { Check, Users, Save, RotateCcw } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Select } from "../../../components/ui/Select";
import { useClassrooms } from "../../settings/api/settings.api";
import { useStudents } from "../../students/api/students.api";
import {
  useClassroomAttendance,
  useBulkRecordStudents,
} from "../api/attendance.api";
import {
  STUDENT_STATUS_CONFIG,
  type StudentAttendanceStatus,
  type BulkStudentAttendanceItem,
} from "../types";

interface StudentAttendanceRow {
  studentId: string;
  studentName: string;
  nisn: string | null;
  nis: string | null;
  gender: string;
  status: StudentAttendanceStatus;
  note: string;
}

export const AttendanceStudentPage: React.FC = () => {
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [attendanceRows, setAttendanceRows] = useState<StudentAttendanceRow[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Queries
  const { data: classrooms = [], isLoading: isLoadingClassrooms } = useClassrooms();
  const { data: studentsResponse, isLoading: isLoadingStudents } = useStudents(
    selectedClassroomId
      ? { classroomId: selectedClassroomId, limit: 100 }
      : undefined
  );
  const {
    data: dailyAttendance,
    isLoading: isLoadingAttendance,
    refetch: refetchAttendance,
  } = useClassroomAttendance(selectedClassroomId, selectedDate, {
    enabled: Boolean(selectedClassroomId && selectedDate),
  });

  const bulkMutation = useBulkRecordStudents();

  // Set default classroom if available and none selected
  useEffect(() => {
    if (!selectedClassroomId && classrooms.length > 0) {
      setSelectedClassroomId(classrooms[0].id);
    }
  }, [classrooms, selectedClassroomId]);

  // Sync rows from student roster + existing attendance
  useEffect(() => {
    const studentsList = studentsResponse?.data || [];
    if (studentsList.length === 0) {
      setAttendanceRows([]);
      return;
    }

    const existingMap = new Map<string, { status: StudentAttendanceStatus; note?: string | null }>();
    if (dailyAttendance?.attendances) {
      dailyAttendance.attendances.forEach((att) => {
        existingMap.set(att.studentId, {
          status: att.status,
          note: att.note,
        });
      });
    }

    const rows: StudentAttendanceRow[] = studentsList.map((st) => {
      const existing = existingMap.get(st.id);
      return {
        studentId: st.id,
        studentName: st.fullName,
        nisn: st.nisn,
        nis: st.nis,
        gender: st.gender,
        status: existing?.status ?? "hadir",
        note: existing?.note || "",
      };
    });

    setAttendanceRows(rows);
    setFeedback(null);
  }, [studentsResponse, dailyAttendance]);

  // Summary statistics
  const summary = useMemo(() => {
    const total = attendanceRows.length;
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;

    attendanceRows.forEach((row) => {
      if (row.status === "hadir") hadir++;
      else if (row.status === "izin") izin++;
      else if (row.status === "sakit") sakit++;
      else if (row.status === "alpa") alpa++;
    });

    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { total, hadir, izin, sakit, alpa, percentage };
  }, [attendanceRows]);

  const handleStatusChange = (studentId: string, status: StudentAttendanceStatus) => {
    setAttendanceRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, note } : r))
    );
  };

  const handleMarkAll = (status: StudentAttendanceStatus) => {
    setAttendanceRows((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSubmit = async () => {
    if (!selectedClassroomId || !selectedDate) {
      setFeedback({ type: "error", message: "Pilih kelas dan tanggal terlebih dahulu" });
      return;
    }

    if (attendanceRows.length === 0) {
      setFeedback({ type: "error", message: "Tidak ada siswa di kelas ini" });
      return;
    }

    try {
      const attendances: BulkStudentAttendanceItem[] = attendanceRows.map((r) => ({
        studentId: r.studentId,
        status: r.status,
        note: r.note.trim() ? r.note.trim() : null,
      }));

      await bulkMutation.mutateAsync({
        classroomId: selectedClassroomId,
        date: selectedDate,
        attendances,
      });

      setFeedback({
        type: "success",
        message: `Presensi ${attendances.length} siswa berhasil disimpan`,
      });
      refetchAttendance();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan presensi";
      setFeedback({ type: "error", message: errorMsg });
    }
  };

  const classroomOptions = useMemo(() => {
    return classrooms.map((c) => ({
      value: c.id,
      label: `${c.name} (Tingkat ${c.gradeLevel})`,
    }));
  }, [classrooms]);

  const isSaving = bulkMutation.isPending;
  const isLoadingData = isLoadingStudents || isLoadingAttendance;

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <Select
              label="Kelas"
              options={classroomOptions}
              value={selectedClassroomId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedClassroomId(e.target.value)
              }
              disabled={isLoadingClassrooms}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Presensi
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSelectedDate(e.target.value)
                }
                className="w-full rounded-md border border-slate-300 text-sm px-3 py-1.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:border-emerald-600 focus:ring-emerald-600"
              />
            </div>
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMarkAll("hadir")}
              disabled={attendanceRows.length === 0 || isSaving}
            >
              <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Semua Hadir
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetchAttendance()}
              disabled={!selectedClassroomId || isSaving}
              title="Reset ke data tersimpan"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-600" />
              Reset
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              isLoading={isSaving}
              disabled={attendanceRows.length === 0}
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              Simpan Presensi Kelas
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="bg-white border border-slate-200 rounded-lg p-2.5">
          <p className="text-[11px] font-medium text-slate-500">Total Siswa</p>
          <p className="text-lg font-bold text-slate-800">{summary.total}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
          <p className="text-[11px] font-medium text-emerald-700">Hadir</p>
          <p className="text-lg font-bold text-emerald-800">{summary.hadir}</p>
        </div>
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-2.5">
          <p className="text-[11px] font-medium text-sky-700">Izin</p>
          <p className="text-lg font-bold text-sky-800">{summary.izin}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          <p className="text-[11px] font-medium text-amber-700">Sakit</p>
          <p className="text-lg font-bold text-amber-800">{summary.sakit}</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5">
          <p className="text-[11px] font-medium text-rose-700">Alpa</p>
          <p className="text-lg font-bold text-rose-800">{summary.alpa}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <p className="text-[11px] font-medium text-slate-600">% Kehadiran</p>
          <p className="text-lg font-bold text-slate-900">{summary.percentage}%</p>
        </div>
      </div>

      {/* Notification banner */}
      {feedback && (
        <div
          className={`px-3 py-2 rounded-md text-xs font-medium border flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Table Daftar Siswa */}
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
                                onClick={() => handleStatusChange(row.studentId, statusKey)}
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
                          handleNoteChange(row.studentId, e.target.value)
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
    </div>
  );
};
