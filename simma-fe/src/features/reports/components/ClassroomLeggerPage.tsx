import React, { useState, useEffect, useMemo } from "react";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Search,
  Users,
  Trophy,
  TrendingUp,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { useClassroomLegger } from "../api/reports.api";
import { useSemesters, useClassrooms, useAcademicYears } from "../../settings/api/settings.api";
import {
  formatSemesterType,
  exportLeggerToCsv,
  type LeggerQueryParams,
} from "../types";

export const ClassroomLeggerPage: React.FC = () => {
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [sortBy, setSortBy] = useState<LeggerQueryParams["sortBy"]>("rank");
  const [order, setOrder] = useState<LeggerQueryParams["order"]>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  // Reference queries
  const { data: academicYears = [] } = useAcademicYears();
  const { data: semesters = [], isLoading: isLoadingSemesters } = useSemesters();
  const { data: classrooms = [], isLoading: isLoadingClassrooms } = useClassrooms();

  const academicYearMap = useMemo(
    () => new Map(academicYears.map((ay) => [ay.id, ay.name])),
    [academicYears]
  );

  // Defaults
  useEffect(() => {
    if (semesters.length > 0 && !selectedSemesterId) {
      const activeSem = semesters.find((s) => s.isActive) || semesters[0];
      setSelectedSemesterId(activeSem.id);
    }
  }, [semesters, selectedSemesterId]);

  useEffect(() => {
    if (classrooms.length > 0 && !selectedClassroomId) {
      setSelectedClassroomId(classrooms[0].id);
    }
  }, [classrooms, selectedClassroomId]);

  // Query Legger
  const {
    data: legger,
    isLoading: isLoadingLegger,
    isError: isErrorLegger,
    error: leggerError,
  } = useClassroomLegger(
    selectedClassroomId || undefined,
    selectedSemesterId || undefined,
    { sortBy, order }
  );

  // Client-side quick filter for table search
  const filteredStudents = useMemo(() => {
    if (!legger?.students) return [];
    if (!searchQuery.trim()) return legger.students;
    const q = searchQuery.toLowerCase();
    return legger.students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        (s.nisn && s.nisn.toLowerCase().includes(q)) ||
        (s.nis && s.nis.toLowerCase().includes(q))
    );
  }, [legger?.students, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!legger) return;
    exportLeggerToCsv(legger);
  };

  return (
    <div className="space-y-4">
      {/* 1. FILTER & CONTROLS TOOLBAR (Screen Only) */}
      <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            label="Rombongan Belajar (Kelas)"
            value={selectedClassroomId}
            onChange={(e) => setSelectedClassroomId(e.target.value)}
            disabled={isLoadingClassrooms}
            options={[
              { value: "", label: "-- Pilih Kelas --" },
              ...classrooms.map((c) => ({
                value: c.id,
                label: `${c.name} (Tingkat ${c.gradeLevel})`,
              })),
            ]}
          />

          <Select
            label="Semester & Tahun Ajaran"
            value={selectedSemesterId}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
            disabled={isLoadingSemesters}
            options={[
              { value: "", label: "-- Pilih Semester --" },
              ...semesters.map((s) => ({
                value: s.id,
                label: `${formatSemesterType(s.type)}${academicYearMap.get(s.academicYearId) ? ` - ${academicYearMap.get(s.academicYearId)}` : ""}${s.isActive ? " (Aktif)" : ""}`,
              })),
            ]}
          />

          <Select
            label="Urutkan Berdasarkan"
            value={sortBy || "rank"}
            onChange={(e) => setSortBy(e.target.value as LeggerQueryParams["sortBy"])}
            options={[
              { value: "rank", label: "Peringkat Kelas" },
              { value: "name", label: "Nama Siswa (A-Z)" },
              { value: "nisn", label: "Nomor NISN" },
              { value: "totalScore", label: "Total Nilai Siswa" },
            ]}
          />

          <Select
            label="Arah Urutan"
            value={order || "asc"}
            onChange={(e) => setOrder(e.target.value as LeggerQueryParams["order"])}
            options={[
              { value: "asc", label: "Menaik (Ascending)" },
              { value: "desc", label: "Menurun (Descending)" },
            ]}
          />
        </div>

        {/* Action bar */}
        {legger && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">
                {legger.classroom?.name}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600">
                Wali Kelas: {legger.classroom?.homeroomTeacher?.fullName || "-"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                Cetak Legger
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportCsv}
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV (Excel)
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 2. STATS CARDS & DATA TABLE (Screen Only) */}
      <div className="print:hidden space-y-4">
        {/* Loading State */}
        {isLoadingLegger && (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-medium text-slate-700">Memuat Buku Legger Kelas...</p>
            <p className="text-xs text-slate-400 mt-1">Mengkalkulasi seluruh nilai per mapel dan statistik kelas</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingLegger && !legger && !isErrorLegger && (
          <div className="bg-white rounded-lg border border-slate-200 p-10 text-center">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Pilih Kelas dan Semester</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Gunakan kontrol di atas untuk melihat buku legger nilai RDM kelas secara menyeluruh.
            </p>
          </div>
        )}

        {/* Error State */}
        {isErrorLegger && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-800">Gagal Memuat Legger Kelas</h4>
              <p className="text-xs text-red-700 mt-0.5">
                {(leggerError as Error)?.message || "Terjadi kesalahan saat memuat data legger kelas."}
              </p>
            </div>
          </div>
        )}

        {/* Populated Content */}
        {legger && (
          <>
            {/* Class Statistics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="p-3 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Total Siswa</span>
                    <span className="text-lg font-bold text-slate-900 leading-tight">
                      {legger.classStatistics?.totalStudents ?? legger.students.length}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Peserta Didik</span>
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Rata-rata Kelas</span>
                    <span className="text-lg font-bold text-sky-700 leading-tight">
                      {(legger.classStatistics?.classAverage ?? 0).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Skala 0 - 100</span>
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Nilai Tertinggi</span>
                    <span className="text-lg font-bold text-amber-700 leading-tight">
                      {(legger.classStatistics?.highestScore ?? 0).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Pencapaian Maksimal</span>
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                    <ArrowUpDown className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Nilai Terendah</span>
                    <span className="text-lg font-bold text-slate-800 leading-tight">
                      {(legger.classStatistics?.lowestScore ?? 0).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Batas Bawah Kelas</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Table Card */}
            <Card
              header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Buku Legger Nilai RDM Kelas
                    </h3>
                    <span className="text-xs text-slate-400">
                      ({filteredStudents.length} dari {legger.students.length} siswa)
                    </span>
                  </div>

                  <div className="w-full sm:w-64">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari siswa atau NISN..."
                        className="w-full rounded-md border border-slate-300 pl-8 pr-3 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:border-emerald-600 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              }
            >
              <div className="overflow-x-auto -mx-4 -mb-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-2.5 w-10 text-center sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                        No
                      </th>
                      <th className="py-2.5 px-3 min-w-36 sticky left-10 bg-slate-50 z-10 border-r border-slate-200 shadow-xs">
                        Nama Siswa
                      </th>
                      <th className="py-2.5 px-2.5 w-24 text-center">NISN</th>
                      <th className="py-2.5 px-2 w-10 text-center">L/P</th>

                      {/* Dynamic Subject Columns */}
                      {legger.subjects.map((sub) => (
                        <th
                          key={sub.id}
                          className="py-2.5 px-2 min-w-16 text-center border-l border-slate-200"
                          title={sub.name}
                        >
                          <div className="truncate max-w-20 mx-auto font-mono text-[10.5px]">
                            {sub.code || sub.name}
                          </div>
                        </th>
                      ))}

                      {/* Summary Columns */}
                      <th className="py-2.5 px-2.5 w-16 text-center border-l-2 border-slate-300 bg-slate-100 font-bold">
                        Total
                      </th>
                      <th className="py-2.5 px-2.5 w-16 text-center bg-slate-100 font-bold">
                        Rata²
                      </th>
                      <th className="py-2.5 px-2.5 w-16 text-center bg-emerald-50 text-emerald-800 font-bold border-r border-slate-200">
                        Rank
                      </th>

                      {/* Attendance Columns */}
                      <th className="py-2.5 px-2 w-10 text-center bg-emerald-50/50 text-emerald-700" title="Hadir">
                        H
                      </th>
                      <th className="py-2.5 px-2 w-10 text-center bg-blue-50/50 text-blue-700" title="Izin">
                        I
                      </th>
                      <th className="py-2.5 px-2 w-10 text-center bg-amber-50/50 text-amber-700" title="Sakit">
                        S
                      </th>
                      <th className="py-2.5 px-2 w-10 text-center bg-rose-50/50 text-rose-700" title="Alpa">
                        A
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((st, idx) => {
                      const gradeMap = new Map<string, { score: number; letter: string }>();
                      st.grades.forEach((g) => {
                        gradeMap.set(g.subjectId, { score: g.score, letter: g.letterGrade });
                      });

                      const isTopRank = st.rank <= 3;

                      return (
                        <tr
                          key={st.studentId}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isTopRank ? "bg-amber-50/20" : ""
                          }`}
                        >
                          <td className="py-2 px-2.5 text-center text-slate-500 font-mono sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900 sticky left-10 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 shadow-xs">
                            <div className="truncate max-w-44">{st.fullName}</div>
                          </td>
                          <td className="py-2 px-2.5 text-center text-slate-500 font-mono text-[11px]">
                            {st.nisn || "-"}
                          </td>
                          <td className="py-2 px-2 text-center text-slate-600 font-medium">
                            {st.gender}
                          </td>

                          {/* Subject Scores */}
                          {legger.subjects.map((sub) => {
                            const grade = gradeMap.get(sub.id);
                            const score = grade?.score;
                            return (
                              <td
                                key={sub.id}
                                className="py-2 px-2 text-center border-l border-slate-100 font-mono"
                              >
                                {score !== undefined ? (
                                  <span
                                    className={`inline-block px-1 rounded-sm ${
                                      score < 70 ? "text-red-600 font-semibold" : "text-slate-800"
                                    }`}
                                  >
                                    {score.toFixed(0)}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                            );
                          })}

                          {/* Total Score */}
                          <td className="py-2 px-2.5 text-center font-bold text-slate-900 border-l-2 border-slate-200 bg-slate-50/70 font-mono">
                            {st.totalScore.toFixed(0)}
                          </td>

                          {/* Average Score */}
                          <td className="py-2 px-2.5 text-center font-bold text-slate-900 bg-slate-50/70 font-mono">
                            {st.averageScore.toFixed(1)}
                          </td>

                          {/* Rank */}
                          <td className="py-2 px-2.5 text-center border-r border-slate-200 bg-emerald-50/30">
                            <span
                              className={`inline-flex items-center justify-center min-w-6 h-5 px-1.5 rounded-full text-xs font-bold ${
                                st.rank === 1
                                  ? "bg-amber-500 text-white"
                                  : st.rank === 2
                                  ? "bg-slate-400 text-white"
                                  : st.rank === 3
                                  ? "bg-amber-700 text-white"
                                  : "text-slate-700"
                              }`}
                            >
                              {st.rank}
                            </span>
                          </td>

                          {/* Attendance */}
                          <td className="py-2 px-2 text-center text-emerald-700 font-medium bg-emerald-50/20">
                            {st.attendance?.hadir ?? 0}
                          </td>
                          <td className="py-2 px-2 text-center text-blue-700 font-medium bg-blue-50/20">
                            {st.attendance?.izin ?? 0}
                          </td>
                          <td className="py-2 px-2 text-center text-amber-700 font-medium bg-amber-50/20">
                            {st.attendance?.sakit ?? 0}
                          </td>
                          <td className="py-2 px-2 text-center text-rose-700 font-medium bg-rose-50/20">
                            {st.attendance?.alpa ?? 0}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td
                          colSpan={9 + legger.subjects.length}
                          className="py-8 text-center text-slate-400 italic"
                        >
                          Tidak ada siswa yang sesuai dengan kriteria pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* 3. PRINT LAYOUT (Official Madrasah Legger Sheet - Print Only) */}
      {legger && (
        <div className="hidden print:block text-slate-900 bg-white font-serif p-4 text-[10px]">
          {/* Header Kop */}
          <div className="text-center border-b-2 border-slate-900 pb-2 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider">
              KEMENTERIAN AGAMA REPUBLIK INDONESIA
            </h2>
            <h1 className="text-sm font-extrabold uppercase mt-0.5">
              BUKU LEGGER NILAI HASIL BELAJAR KELAS (RDM)
            </h1>
            <p className="text-[9px] text-slate-600 mt-0.5">
              Kelas: <span className="font-bold">{legger.classroom?.name}</span> | Semester:{" "}
              <span className="font-bold">{formatSemesterType(legger.semester?.type)}</span> | Tahun Ajaran:{" "}
              <span className="font-bold">{legger.academicYear?.name}</span> | Wali Kelas:{" "}
              <span className="font-bold">{legger.classroom?.homeroomTeacher?.fullName || "-"}</span>
            </p>
          </div>

          {/* Table Legger for Print */}
          <table className="w-full border-collapse border border-slate-900 text-[9px] mb-4">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-900">
                <th className="border border-slate-900 py-1 px-1 text-center w-6">No</th>
                <th className="border border-slate-900 py-1 px-1 text-center w-16">NISN</th>
                <th className="border border-slate-900 py-1 px-2 text-left">Nama Siswa</th>
                <th className="border border-slate-900 py-1 px-1 text-center w-6">L/P</th>

                {legger.subjects.map((sub) => (
                  <th
                    key={sub.id}
                    className="border border-slate-900 py-1 px-1 text-center min-w-10"
                  >
                    {sub.code || sub.name}
                  </th>
                ))}

                <th className="border border-slate-900 py-1 px-1 text-center w-10 font-bold">Total</th>
                <th className="border border-slate-900 py-1 px-1 text-center w-10 font-bold">Rata²</th>
                <th className="border border-slate-900 py-1 px-1 text-center w-8 font-bold">Rank</th>
                <th className="border border-slate-900 py-1 px-1 text-center w-6">H</th>
                <th className="border border-slate-900 py-1 px-1 text-center w-6">I</th>
                <th className="border border-slate-900 py-1 px-1 text-center w-6">S</th>
                <th className="border border-slate-900 py-1 px-1 text-center w-6">A</th>
              </tr>
            </thead>
            <tbody>
              {legger.students.map((st, i) => {
                const map = new Map<string, number>();
                st.grades.forEach((g) => map.set(g.subjectId, g.score));

                return (
                  <tr key={st.studentId}>
                    <td className="border border-slate-900 py-1 px-1 text-center">{i + 1}</td>
                    <td className="border border-slate-900 py-1 px-1 text-center font-mono">
                      {st.nisn || "-"}
                    </td>
                    <td className="border border-slate-900 py-1 px-2 font-medium">{st.fullName}</td>
                    <td className="border border-slate-900 py-1 px-1 text-center">{st.gender}</td>

                    {legger.subjects.map((sub) => {
                      const sc = map.get(sub.id);
                      return (
                        <td key={sub.id} className="border border-slate-900 py-1 px-1 text-center font-mono">
                          {sc !== undefined ? sc.toFixed(0) : "-"}
                        </td>
                      );
                    })}

                    <td className="border border-slate-900 py-1 px-1 text-center font-bold font-mono">
                      {st.totalScore.toFixed(0)}
                    </td>
                    <td className="border border-slate-900 py-1 px-1 text-center font-bold font-mono">
                      {st.averageScore.toFixed(1)}
                    </td>
                    <td className="border border-slate-900 py-1 px-1 text-center font-bold">
                      {st.rank}
                    </td>
                    <td className="border border-slate-900 py-1 px-1 text-center">{st.attendance?.hadir ?? 0}</td>
                    <td className="border border-slate-900 py-1 px-1 text-center">{st.attendance?.izin ?? 0}</td>
                    <td className="border border-slate-900 py-1 px-1 text-center">{st.attendance?.sakit ?? 0}</td>
                    <td className="border border-slate-900 py-1 px-1 text-center">{st.attendance?.alpa ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Validation signatures */}
          <div className="grid grid-cols-2 gap-8 text-center text-[9.5px] mt-6">
            <div>
              <p>Mengetahui,</p>
              <p>Kepala Madrasah</p>
              <div className="h-14" />
              <p className="font-bold border-b border-slate-900 inline-block min-w-36">
                ..........................................
              </p>
              <p>NIP/NSM: ..............................</p>
            </div>

            <div>
              <p>Dibuat di, .........................</p>
              <p>Wali Kelas</p>
              <div className="h-14" />
              <p className="font-bold border-b border-slate-900 inline-block min-w-36">
                {legger.classroom?.homeroomTeacher?.fullName || "...................................."}
              </p>
              <p>NUPTK: {legger.classroom?.homeroomTeacher?.nuptk || "........................."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
