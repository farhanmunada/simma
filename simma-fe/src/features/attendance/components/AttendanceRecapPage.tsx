import React, { useState, useMemo } from "react";
import {
  Filter,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Select } from "../../../components/ui/Select";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { useClassrooms, useTeachers } from "../../settings/api/settings.api";
import {
  useStudentAttendances,
  useTeacherAttendances,
  useStudentSummary,
  useTeacherSummary,
} from "../api/attendance.api";
import {
  STUDENT_STATUS_CONFIG,
  TEACHER_STATUS_CONFIG,
  type StudentAttendanceStatus,
  type TeacherAttendanceStatus,
} from "../types";

export const AttendanceRecapPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"students" | "teachers">("students");

  // Filter states
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const today = now.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState<string>(firstDayOfMonth);
  const [endDate, setEndDate] = useState<string>(today);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [selectedStudentStatus, setSelectedStudentStatus] = useState<string>("");
  const [selectedTeacherStatus, setSelectedTeacherStatus] = useState<string>("");

  // Modal / Detail summary view
  const [selectedStudentForSummary, setSelectedStudentForSummary] = useState<{
    id: string;
    name?: string;
  } | null>(null);
  const [selectedTeacherForSummary, setSelectedTeacherForSummary] = useState<{
    id: string;
    name?: string;
  } | null>(null);

  // Queries
  const { data: classrooms = [] } = useClassrooms();
  const { data: teachers = [] } = useTeachers({ limit: 100 });

  const studentQueryParams = useMemo(() => {
    return {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      classroomId: selectedClassroomId || undefined,
      status: selectedStudentStatus
        ? (selectedStudentStatus as StudentAttendanceStatus)
        : undefined,
      limit: 100,
    };
  }, [startDate, endDate, selectedClassroomId, selectedStudentStatus]);

  const teacherQueryParams = useMemo(() => {
    return {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: selectedTeacherStatus
        ? (selectedTeacherStatus as TeacherAttendanceStatus)
        : undefined,
      limit: 100,
    };
  }, [startDate, endDate, selectedTeacherStatus]);

  const {
    data: studentRecordsRes,
    isLoading: isLoadingStudentRecords,
  } = useStudentAttendances(studentQueryParams);

  const {
    data: teacherRecordsRes,
    isLoading: isLoadingTeacherRecords,
  } = useTeacherAttendances(teacherQueryParams);

  const { data: studentSummaryData, isLoading: isLoadingStudentSummary } =
    useStudentSummary(
      selectedStudentForSummary?.id,
      { startDate: startDate || undefined, endDate: endDate || undefined },
      { enabled: Boolean(selectedStudentForSummary?.id) }
    );

  const { data: teacherSummaryData, isLoading: isLoadingTeacherSummary } =
    useTeacherSummary(
      selectedTeacherForSummary?.id,
      { startDate: startDate || undefined, endDate: endDate || undefined },
      { enabled: Boolean(selectedTeacherForSummary?.id) }
    );

  // Aggregated Summary Statistics
  const studentStats = useMemo(() => {
    const list = studentRecordsRes?.data || [];
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;
    list.forEach((r) => {
      if (r.status === "hadir") hadir++;
      else if (r.status === "izin") izin++;
      else if (r.status === "sakit") sakit++;
      else if (r.status === "alpa") alpa++;
    });
    const total = list.length;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { hadir, izin, sakit, alpa, total, percentage };
  }, [studentRecordsRes]);

  const teacherStats = useMemo(() => {
    const list = teacherRecordsRes?.data || [];
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;
    let dinasLuar = 0;
    list.forEach((r) => {
      if (r.status === "hadir") hadir++;
      else if (r.status === "izin") izin++;
      else if (r.status === "sakit") sakit++;
      else if (r.status === "alpa") alpa++;
      else if (r.status === "dinas_luar") dinasLuar++;
    });
    const total = list.length;
    const activePresent = hadir + dinasLuar;
    const percentage = total > 0 ? Math.round((activePresent / total) * 100) : 0;
    return { hadir, izin, sakit, alpa, dinasLuar, total, percentage };
  }, [teacherRecordsRes]);

  const classroomOptions = useMemo(() => {
    return [
      { value: "", label: "Semua Kelas" },
      ...classrooms.map((c) => ({
        value: c.id,
        label: `${c.name} (Tingkat ${c.gradeLevel})`,
      })),
    ];
  }, [classrooms]);

  const studentStatusOptions = [
    { value: "", label: "Semua Status" },
    { value: "hadir", label: "Hadir" },
    { value: "izin", label: "Izin" },
    { value: "sakit", label: "Sakit" },
    { value: "alpa", label: "Alpa" },
  ];

  const teacherStatusOptions = [
    { value: "", label: "Semua Status" },
    { value: "hadir", label: "Hadir" },
    { value: "izin", label: "Izin" },
    { value: "sakit", label: "Sakit" },
    { value: "alpa", label: "Alpa" },
    { value: "dinas_luar", label: "Dinas Luar" },
  ];

  // Lookup map for teacher names
  const teacherMap = useMemo(() => {
    const m = new Map<string, string>();
    teachers.forEach((t) => m.set(t.id, t.fullName));
    return m;
  }, [teachers]);

  // Lookup map for classroom names
  const classroomMap = useMemo(() => {
    const m = new Map<string, string>();
    classrooms.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [classrooms]);

  return (
    <div className="space-y-4">
      {/* Switcher & Filter Controls */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100 mb-3">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setActiveTab("students")}
              className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "students"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
              Rekap Siswa
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("teachers")}
              className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "teachers"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 mr-1.5" />
              Rekap Guru & GTK
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Periode: {startDate} s/d {endDate}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setStartDate(e.target.value)
              }
              className="w-full rounded-md border border-slate-300 text-sm px-3 py-1.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:border-emerald-600 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEndDate(e.target.value)
              }
              className="w-full rounded-md border border-slate-300 text-sm px-3 py-1.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:border-emerald-600 focus:ring-emerald-600"
            />
          </div>

          {activeTab === "students" ? (
            <>
              <div>
                <Select
                  label="Filter Kelas"
                  options={classroomOptions}
                  value={selectedClassroomId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSelectedClassroomId(e.target.value)
                  }
                />
              </div>
              <div>
                <Select
                  label="Filter Status"
                  options={studentStatusOptions}
                  value={selectedStudentStatus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSelectedStudentStatus(e.target.value)
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Select
                  label="Filter Status"
                  options={teacherStatusOptions}
                  value={selectedTeacherStatus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSelectedTeacherStatus(e.target.value)
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate(firstDayOfMonth);
                    setEndDate(today);
                    setSelectedTeacherStatus("");
                  }}
                >
                  Reset Filter
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Aggregate KPI Strip */}
      {activeTab === "students" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <div className="bg-white border border-slate-200 rounded-lg p-2.5">
            <p className="text-[11px] font-medium text-slate-500">Total Catatan</p>
            <p className="text-lg font-bold text-slate-800">{studentStats.total}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
            <p className="text-[11px] font-medium text-emerald-700">Hadir</p>
            <p className="text-lg font-bold text-emerald-800">{studentStats.hadir}</p>
          </div>
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-2.5">
            <p className="text-[11px] font-medium text-sky-700">Izin</p>
            <p className="text-lg font-bold text-sky-800">{studentStats.izin}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <p className="text-[11px] font-medium text-amber-700">Sakit</p>
            <p className="text-lg font-bold text-amber-800">{studentStats.sakit}</p>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5">
            <p className="text-[11px] font-medium text-rose-700">Alpa</p>
            <p className="text-lg font-bold text-rose-800">{studentStats.alpa}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
            <p className="text-[11px] font-medium text-slate-600">% Kehadiran</p>
            <p className="text-lg font-bold text-slate-900">
              {studentStats.percentage}%
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <div className="bg-white border border-slate-200 rounded-lg p-2.5">
            <p className="text-[11px] font-medium text-slate-500">Total Catatan</p>
            <p className="text-lg font-bold text-slate-800">{teacherStats.total}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
            <p className="text-[11px] font-medium text-emerald-700">Hadir</p>
            <p className="text-lg font-bold text-emerald-800">{teacherStats.hadir}</p>
          </div>
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-2.5">
            <p className="text-[11px] font-medium text-sky-700">Izin</p>
            <p className="text-lg font-bold text-sky-800">{teacherStats.izin}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <p className="text-[11px] font-medium text-amber-700">Sakit</p>
            <p className="text-lg font-bold text-amber-800">{teacherStats.sakit}</p>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5">
            <p className="text-[11px] font-medium text-rose-700">Alpa</p>
            <p className="text-lg font-bold text-rose-800">{teacherStats.alpa}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5">
            <p className="text-[11px] font-medium text-purple-700">Dinas Luar</p>
            <p className="text-lg font-bold text-purple-800">
              {teacherStats.dinasLuar}
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
            <p className="text-[11px] font-medium text-slate-600">% Kehadiran</p>
            <p className="text-lg font-bold text-slate-900">
              {teacherStats.percentage}%
            </p>
          </div>
        </div>
      )}

      {/* Main Table */}
      <Card>
        <div className="overflow-x-auto -mx-4 -my-4">
          {activeTab === "students" ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-2.5 px-3 font-semibold text-slate-700 w-10 text-center">
                    No
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 w-28">Tanggal</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 min-w-44">
                    ID Siswa
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 w-32">Kelas</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 w-24 text-center">
                    Status
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 min-w-44">
                    Catatan
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 w-20 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingStudentRecords ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Memuat data rekap presensi siswa...
                    </td>
                  </tr>
                ) : (studentRecordsRes?.data || []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Tidak ada catatan presensi siswa pada filter ini.
                    </td>
                  </tr>
                ) : (
                  studentRecordsRes!.data.map((r, idx) => {
                    const cfg = STUDENT_STATUS_CONFIG[r.status];
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2 px-3 text-center text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">{r.date}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                          {r.studentId}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {classroomMap.get(r.classroomId) || r.classroomId.slice(0, 8)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Badge variant={cfg.badgeVariant}>{cfg.label}</Badge>
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {r.note || <span className="text-slate-300">-</span>}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedStudentForSummary({
                                id: r.studentId,
                              })
                            }
                            className="text-emerald-600 hover:text-emerald-800 font-medium text-[11px]"
                          >
                            Rekap
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-2.5 px-3 font-semibold text-slate-700 w-10 text-center">
                    No
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 w-28">Tanggal</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 min-w-44">
                    Nama Guru / GTK
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 w-28 text-center">
                    Status
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 min-w-44">
                    Catatan
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-slate-700 w-20 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingTeacherRecords ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Memuat data rekap presensi guru...
                    </td>
                  </tr>
                ) : (teacherRecordsRes?.data || []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Tidak ada catatan presensi guru pada filter ini.
                    </td>
                  </tr>
                ) : (
                  teacherRecordsRes!.data.map((r, idx) => {
                    const cfg = TEACHER_STATUS_CONFIG[r.status];
                    const teacherName = teacherMap.get(r.teacherId) || r.teacherId;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2 px-3 text-center text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">{r.date}</td>
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {teacherName}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Badge variant={cfg.badgeVariant}>{cfg.label}</Badge>
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {r.note || <span className="text-slate-300">-</span>}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTeacherForSummary({
                                id: r.teacherId,
                                name: teacherName,
                              })
                            }
                            className="text-emerald-600 hover:text-emerald-800 font-medium text-[11px]"
                          >
                            Rekap
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Student Individual Summary Modal */}
      <Modal
        isOpen={Boolean(selectedStudentForSummary)}
        onClose={() => setSelectedStudentForSummary(null)}
        title="Rekap Kehadiran Akumulatif Siswa"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            ID Siswa:{" "}
            <span className="font-mono text-slate-800 font-semibold">
              {selectedStudentForSummary?.id}
            </span>
            <br />
            Periode: {startDate} s/d {endDate}
          </div>

          {isLoadingStudentSummary ? (
            <p className="text-xs text-slate-500 py-4 text-center">Memuat rekap siswa...</p>
          ) : studentSummaryData ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-[11px] text-emerald-700 font-medium">Hadir</p>
                <p className="text-xl font-bold text-emerald-800">
                  {studentSummaryData.hadir}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-200">
                <p className="text-[11px] text-sky-700 font-medium">Izin</p>
                <p className="text-xl font-bold text-sky-800">
                  {studentSummaryData.izin}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-[11px] text-amber-700 font-medium">Sakit</p>
                <p className="text-xl font-bold text-amber-800">
                  {studentSummaryData.sakit}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <p className="text-[11px] text-rose-700 font-medium">Alpa</p>
                <p className="text-xl font-bold text-rose-800">
                  {studentSummaryData.alpa}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-[11px] text-slate-600 font-medium">Total Hari</p>
                <p className="text-xl font-bold text-slate-800">
                  {studentSummaryData.total}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100/60 border border-emerald-300">
                <p className="text-[11px] text-emerald-800 font-medium">% Kehadiran</p>
                <p className="text-xl font-bold text-emerald-900">
                  {studentSummaryData.attendancePercentage}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Tidak ada data rekap ditemukan.</p>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedStudentForSummary(null)}
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>

      {/* Teacher Individual Summary Modal */}
      <Modal
        isOpen={Boolean(selectedTeacherForSummary)}
        onClose={() => setSelectedTeacherForSummary(null)}
        title="Rekap Kehadiran Akumulatif Guru & GTK"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            Guru:{" "}
            <span className="text-slate-800 font-semibold">
              {selectedTeacherForSummary?.name || selectedTeacherForSummary?.id}
            </span>
            <br />
            Periode: {startDate} s/d {endDate}
          </div>

          {isLoadingTeacherSummary ? (
            <p className="text-xs text-slate-500 py-4 text-center">Memuat rekap guru...</p>
          ) : teacherSummaryData ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-[11px] text-emerald-700 font-medium">Hadir</p>
                <p className="text-xl font-bold text-emerald-800">
                  {teacherSummaryData.hadir}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-200">
                <p className="text-[11px] text-sky-700 font-medium">Izin</p>
                <p className="text-xl font-bold text-sky-800">
                  {teacherSummaryData.izin}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-[11px] text-amber-700 font-medium">Sakit</p>
                <p className="text-xl font-bold text-amber-800">
                  {teacherSummaryData.sakit}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <p className="text-[11px] text-rose-700 font-medium">Alpa</p>
                <p className="text-xl font-bold text-rose-800">
                  {teacherSummaryData.alpa}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                <p className="text-[11px] text-purple-700 font-medium">Dinas Luar</p>
                <p className="text-xl font-bold text-purple-800">
                  {teacherSummaryData.dinasLuar}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100/60 border border-emerald-300">
                <p className="text-[11px] text-emerald-800 font-medium">% Kehadiran</p>
                <p className="text-xl font-bold text-emerald-900">
                  {teacherSummaryData.attendancePercentage}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Tidak ada data rekap ditemukan.</p>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedTeacherForSummary(null)}
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
