import React, { useState, useMemo } from "react";
import { useStudentAttendances, useTeacherAttendances } from "../api/attendance.api";
import { useClassrooms } from "../../settings";
import { AttendanceFilterBar } from "./AttendanceFilterBar";
import { AttendanceRecapSummaryCards } from "./AttendanceRecapSummaryCards";
import { AttendanceRecapTable } from "./AttendanceRecapTable";
import { AttendanceExportModal } from "./AttendanceExportModal";
import { AttendanceSummaryModal } from "./AttendanceSummaryModal";
import type { AttendanceStudentStatus, AttendanceTeacherStatus } from "../types";

export const AttendanceRecapPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"students" | "teachers">("students");
  const [isExportOpen, setIsExportOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(today);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [selectedStudentStatus, setSelectedStudentStatus] = useState<AttendanceStudentStatus | "">("");
  const [selectedTeacherStatus, setSelectedTeacherStatus] = useState<AttendanceTeacherStatus | "">("");

  const [selectedStudentSummary, setSelectedStudentSummary] = useState<{ id: string; name?: string } | null>(null);
  const [selectedTeacherSummary, setSelectedTeacherSummary] = useState<{ id: string; name?: string } | null>(null);

  const { data: classrooms = [] } = useClassrooms();

  const { data: studentData, isLoading: isLoadingStudent } = useStudentAttendances({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    classroomId: selectedClassroomId || undefined,
    status: selectedStudentStatus || undefined,
    limit: 100,
  });

  const { data: teacherData, isLoading: isLoadingTeacher } = useTeacherAttendances({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    status: selectedTeacherStatus || undefined,
    limit: 100,
  });

  const studentRecords = studentData?.data || [];
  const teacherRecords = teacherData?.data || [];

  const classroomOptions = useMemo(() => {
    if (classrooms.length > 0) {
      const list = classrooms.map((c) => ({
        value: c.id,
        label: `${c.name} (Tingkat ${c.gradeLevel})`,
      }));
      return [
        { value: "", label: "Semua Rombel" },
        ...list,
      ];
    }
    const map = new Map<string, string>();
    studentRecords.forEach((item) => {
      if (item.classroomId) {
        map.set(item.classroomId, item.classroom?.name || `Kelas ${item.classroomId.slice(0, 6)}`);
      }
    });
    return [
      { value: "", label: "Semua Rombel" },
      ...Array.from(map.entries()).map(([value, label]) => ({ value, label })),
    ];
  }, [classrooms, studentRecords]);

  const classroomMap = useMemo(() => {
    const map = new Map<string, string>();
    classrooms.forEach((c) => {
      map.set(c.id, c.name);
    });
    studentRecords.forEach((item) => {
      if (item.classroomId && !map.has(item.classroomId)) {
        map.set(item.classroomId, item.classroom?.name || item.classroomId);
      }
    });
    return map;
  }, [classrooms, studentRecords]);

  const teacherMap = useMemo(() => {
    const map = new Map<string, string>();
    studentRecords.forEach((item) => {
      if (item.teacherId && item.teacher?.fullName) {
        map.set(item.teacherId, item.teacher.fullName);
      }
    });
    teacherRecords.forEach((item) => {
      if (item.teacherId && item.teacher?.fullName) {
        map.set(item.teacherId, item.teacher.fullName);
      }
    });
    return map;
  }, [studentRecords, teacherRecords]);

  const studentStats = useMemo(() => {
    const total = studentRecords.length;
    const hadir = studentRecords.filter((r) => r.status === "hadir").length;
    const izin = studentRecords.filter((r) => r.status === "izin").length;
    const sakit = studentRecords.filter((r) => r.status === "sakit").length;
    const alpa = studentRecords.filter((r) => r.status === "alpa").length;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { total, hadir, izin, sakit, alpa, percentage };
  }, [studentRecords]);

  const teacherStats = useMemo(() => {
    const total = teacherRecords.length;
    const hadir = teacherRecords.filter((r) => r.status === "hadir").length;
    const izin = teacherRecords.filter((r) => r.status === "izin").length;
    const sakit = teacherRecords.filter((r) => r.status === "sakit").length;
    const alpa = teacherRecords.filter((r) => r.status === "alpa").length;
    const dinasLuar = teacherRecords.filter((r) => r.status === "dinas_luar").length;
    const percentage = total > 0 ? Math.round(((hadir + dinasLuar) / total) * 100) : 0;
    return { total, hadir, izin, sakit, alpa, dinasLuar, percentage };
  }, [teacherRecords]);

  const handleResetFilters = () => {
    setStartDate(defaultStart);
    setEndDate(today);
    setSelectedClassroomId("");
    setSelectedStudentStatus("");
    setSelectedTeacherStatus("");
  };

  const handleQuickPreset = (preset: "week" | "month") => {
    const end = new Date().toISOString().split("T")[0];
    let start = "";
    if (preset === "week") {
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    } else {
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    }
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="space-y-4">
      <AttendanceFilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        selectedClassroomId={selectedClassroomId}
        onClassroomIdChange={setSelectedClassroomId}
        selectedStudentStatus={selectedStudentStatus}
        onStudentStatusChange={(s) => setSelectedStudentStatus(s as AttendanceStudentStatus | "")}
        selectedTeacherStatus={selectedTeacherStatus}
        onTeacherStatusChange={(s) => setSelectedTeacherStatus(s as AttendanceTeacherStatus | "")}
        classroomOptions={classroomOptions}
        onReset={handleResetFilters}
        onOpenExport={() => setIsExportOpen(true)}
        onQuickPreset={handleQuickPreset}
      />

      <AttendanceRecapSummaryCards
        activeTab={activeTab}
        studentStats={studentStats}
        teacherStats={teacherStats}
      />

      <AttendanceRecapTable
        activeTab={activeTab}
        studentRecords={studentRecords}
        teacherRecords={teacherRecords}
        isLoadingStudent={isLoadingStudent}
        isLoadingTeacher={isLoadingTeacher}
        classroomMap={classroomMap}
        teacherMap={teacherMap}
        onSelectStudentSummary={setSelectedStudentSummary}
        onSelectTeacherSummary={setSelectedTeacherSummary}
      />

      <AttendanceExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        activeTab={activeTab}
        startDate={startDate}
        endDate={endDate}
        studentRecords={studentRecords}
        teacherRecords={teacherRecords}
        classroomMap={classroomMap}
        teacherMap={teacherMap}
      />

      <AttendanceSummaryModal
        selectedStudent={selectedStudentSummary}
        onCloseStudent={() => setSelectedStudentSummary(null)}
        selectedTeacher={selectedTeacherSummary}
        onCloseTeacher={() => setSelectedTeacherSummary(null)}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
};
