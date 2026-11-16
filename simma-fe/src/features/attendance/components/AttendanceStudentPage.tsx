import React, { useState, useEffect, useMemo } from "react";
import { Check, RotateCcw, Save } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { useClassrooms } from "../../settings";
import { useStudents } from "../../students/api/students.api";
import {
  useClassroomAttendance,
  useBulkRecordStudents,
} from "../api/attendance.api";
import { AttendanceStudentTable, type StudentAttendanceRow } from "./AttendanceStudentTable";
import type { StudentAttendanceStatus } from "../types";

export const AttendanceStudentPage: React.FC = () => {
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [attendanceRows, setAttendanceRows] = useState<StudentAttendanceRow[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { data: classrooms = [], isLoading: isLoadingClassrooms } = useClassrooms();

  useEffect(() => {
    if (classrooms.length > 0 && !selectedClassroomId) {
      setSelectedClassroomId(classrooms[0].id);
    }
  }, [classrooms, selectedClassroomId]);

  const { data: studentsResponse, isLoading: isLoadingStudents } = useStudents(
    selectedClassroomId ? { classroomId: selectedClassroomId, limit: 100 } : undefined
  );

  const currentClassStudents = useMemo(() => {
    return studentsResponse?.data || [];
  }, [studentsResponse]);

  const {
    data: existingClassroomData,
    isLoading: isLoadingAttendance,
    refetch: refetchAttendance,
  } = useClassroomAttendance(selectedClassroomId, selectedDate);

  useEffect(() => {
    if (!currentClassStudents.length) {
      setAttendanceRows([]);
      return;
    }

    const attendanceMap = new Map<string, { status: StudentAttendanceStatus; note?: string }>();
    const existingList = Array.isArray(existingClassroomData)
      ? existingClassroomData
      : existingClassroomData?.attendances || [];
    existingList.forEach((att) => {
      attendanceMap.set(att.studentId, {
        status: att.status as StudentAttendanceStatus,
        note: att.note || "",
      });
    });

    const mapped: StudentAttendanceRow[] = currentClassStudents.map((std) => {
      const recorded = attendanceMap.get(std.id);
      return {
        studentId: std.id,
        studentName: std.fullName,
        nisn: std.nisn || undefined,
        nis: std.nis || undefined,
        gender: std.gender || undefined,
        status: recorded ? recorded.status : "hadir",
        note: recorded?.note || "",
      };
    });

    setAttendanceRows(mapped);
  }, [currentClassStudents, existingClassroomData]);

  const handleStatusChange = (studentId: string, status: StudentAttendanceStatus) => {
    setAttendanceRows((prev) =>
      prev.map((row) => (row.studentId === studentId ? { ...row, status } : row))
    );
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceRows((prev) =>
      prev.map((row) => (row.studentId === studentId ? { ...row, note } : row))
    );
  };

  const handleMarkAll = (status: StudentAttendanceStatus) => {
    setAttendanceRows((prev) => prev.map((row) => ({ ...row, status })));
  };

  const summary = useMemo(() => {
    const total = attendanceRows.length;
    const hadir = attendanceRows.filter((r) => r.status === "hadir").length;
    const izin = attendanceRows.filter((r) => r.status === "izin").length;
    const sakit = attendanceRows.filter((r) => r.status === "sakit").length;
    const alpa = attendanceRows.filter((r) => r.status === "alpa").length;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { total, hadir, izin, sakit, alpa, percentage };
  }, [attendanceRows]);

  const bulkMutation = useBulkRecordStudents();

  const handleSubmit = async () => {
    if (!selectedClassroomId) {
      setFeedback({ type: "error", message: "Pilih kelas terlebih dahulu" });
      return;
    }
    if (attendanceRows.length === 0) {
      setFeedback({ type: "error", message: "Tidak ada siswa di kelas ini" });
      return;
    }

    try {
      const attendances = attendanceRows.map((r) => ({
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
  const isTableLoading = isLoadingClassrooms || isLoadingStudents || isLoadingAttendance;

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

      {/* Feedback Alert */}
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

      {/* Student Table */}
      <AttendanceStudentTable
        attendanceRows={attendanceRows}
        isLoadingData={isTableLoading}
        onStatusChange={handleStatusChange}
        onNoteChange={handleNoteChange}
      />
    </div>
  );
};
