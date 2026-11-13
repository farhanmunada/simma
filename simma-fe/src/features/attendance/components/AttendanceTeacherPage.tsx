import React, { useState, useEffect, useMemo } from "react";
import { Check, RotateCcw, Save } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { useTeachers } from "../../settings/api/settings.api";
import {
  useTeacherAttendances,
  useBulkRecordTeachers,
} from "../api/attendance.api";
import { AttendanceTeacherTable, type TeacherAttendanceRow } from "./AttendanceTeacherTable";
import type { TeacherAttendanceStatus, BulkTeacherAttendanceItem } from "../types";

export const AttendanceTeacherPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [attendanceRows, setAttendanceRows] = useState<TeacherAttendanceRow[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Queries
  const { data: teachers = [], isLoading: isLoadingTeachers } = useTeachers({
    limit: 100,
  });
  const {
    data: dailyAttendanceRes,
    isLoading: isLoadingAttendance,
    refetch: refetchAttendance,
  } = useTeacherAttendances({ date: selectedDate });

  const bulkMutation = useBulkRecordTeachers();

  // Sync rows from teacher roster + existing attendances
  useEffect(() => {
    if (teachers.length === 0) {
      setAttendanceRows([]);
      return;
    }

    const existingMap = new Map<
      string,
      { status: TeacherAttendanceStatus; note?: string | null }
    >();
    if (dailyAttendanceRes?.data) {
      dailyAttendanceRes.data.forEach((att) => {
        existingMap.set(att.teacherId, {
          status: att.status,
          note: att.note,
        });
      });
    }

    const rows: TeacherAttendanceRow[] = teachers.map((t) => {
      const existing = existingMap.get(t.id);
      return {
        teacherId: t.id,
        fullName: t.fullName,
        nuptk: t.nuptk || undefined,
        nik: t.nik,
        employmentType: t.employmentType,
        status: existing?.status ?? "hadir",
        note: existing?.note || "",
      };
    });

    setAttendanceRows(rows);
    setFeedback(null);
  }, [teachers, dailyAttendanceRes]);

  // Summary statistics
  const summary = useMemo(() => {
    const total = attendanceRows.length;
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;
    let dinasLuar = 0;

    attendanceRows.forEach((row) => {
      if (row.status === "hadir") hadir++;
      else if (row.status === "izin") izin++;
      else if (row.status === "sakit") sakit++;
      else if (row.status === "alpa") alpa++;
      else if (row.status === "dinas_luar") dinasLuar++;
    });

    const activePresent = hadir + dinasLuar;
    const percentage = total > 0 ? Math.round((activePresent / total) * 100) : 0;

    return { total, hadir, izin, sakit, alpa, dinasLuar, percentage };
  }, [attendanceRows]);

  const handleStatusChange = (teacherId: string, status: TeacherAttendanceStatus) => {
    setAttendanceRows((prev) =>
      prev.map((r) => (r.teacherId === teacherId ? { ...r, status } : r))
    );
  };

  const handleNoteChange = (teacherId: string, note: string) => {
    setAttendanceRows((prev) =>
      prev.map((r) => (r.teacherId === teacherId ? { ...r, note } : r))
    );
  };

  const handleMarkAll = (status: TeacherAttendanceStatus) => {
    setAttendanceRows((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSubmit = async () => {
    if (!selectedDate) {
      setFeedback({ type: "error", message: "Pilih tanggal terlebih dahulu" });
      return;
    }

    if (attendanceRows.length === 0) {
      setFeedback({ type: "error", message: "Tidak ada data guru/GTK" });
      return;
    }

    try {
      const attendances: BulkTeacherAttendanceItem[] = attendanceRows.map((r) => ({
        teacherId: r.teacherId,
        status: r.status,
        note: r.note.trim() ? r.note.trim() : null,
      }));

      await bulkMutation.mutateAsync({
        date: selectedDate,
        attendances,
      });

      setFeedback({
        type: "success",
        message: `Presensi ${attendances.length} guru & GTK berhasil disimpan`,
      });
      refetchAttendance();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal menyimpan presensi guru";
      setFeedback({ type: "error", message: errorMsg });
    }
  };

  const isSaving = bulkMutation.isPending;
  const isLoadingData = isLoadingTeachers || isLoadingAttendance;

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Presensi
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSelectedDate(e.target.value)
              }
              className="w-full rounded-md border border-slate-300 text-sm px-3 py-1.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:border-emerald-600 focus:ring-emerald-600"
            />
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
              disabled={isSaving}
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
              Simpan Presensi GTK
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <div className="bg-white border border-slate-200 rounded-lg p-2.5">
          <p className="text-[11px] font-medium text-slate-500">Total GTK</p>
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
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5">
          <p className="text-[11px] font-medium text-purple-700">Dinas Luar</p>
          <p className="text-lg font-bold text-purple-800">{summary.dinasLuar}</p>
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

      {/* Teacher Table */}
      <AttendanceTeacherTable
        attendanceRows={attendanceRows}
        isLoadingData={isLoadingData}
        onStatusChange={handleStatusChange}
        onNoteChange={handleNoteChange}
      />
    </div>
  );
};
