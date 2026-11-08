import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Printer,
  Edit3,
  Award,
  AlertCircle,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { Modal } from "../../../components/ui/Modal";
import {
  useStudentReportCard,
  useDownloadReportPdf,
  useSaveStudentNotes,
} from "../api/reports.api";
import { useSemesters, useClassrooms, useAcademicYears } from "../../settings/api/settings.api";
import { useStudents } from "../../students/api/students.api";
import {
  getLetterGradeBadgeClass,
  formatSemesterType,
  type ExtracurricularItem,
  type AchievementItem,
} from "../types";

export const StudentReportCardPage: React.FC = () => {
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [includeTahfidz, setIncludeTahfidz] = useState<boolean>(true);
  const [includeAttendance, setIncludeAttendance] = useState<boolean>(true);

  // Modal edit notes state
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [teacherNotes, setTeacherNotes] = useState("");
  const [spiritualAttitude, setSpiritualAttitude] = useState("");
  const [socialAttitude, setSocialAttitude] = useState("");
  const [extracurriculars, setExtracurriculars] = useState<ExtracurricularItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);

  // Reference queries
  const { data: academicYears = [] } = useAcademicYears();
  const { data: semesters = [], isLoading: isLoadingSemesters } = useSemesters();
  const { data: classrooms = [], isLoading: isLoadingClassrooms } = useClassrooms();
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents(
    selectedClassroomId ? { classroomId: selectedClassroomId } : undefined
  );
  const students = studentsData?.data || [];

  const academicYearMap = React.useMemo(
    () => new Map(academicYears.map((ay) => [ay.id, ay.name])),
    [academicYears]
  );

  // Default selection for semester
  useEffect(() => {
    if (semesters.length > 0 && !selectedSemesterId) {
      const activeSem = semesters.find((s) => s.isActive) || semesters[0];
      setSelectedSemesterId(activeSem.id);
    }
  }, [semesters, selectedSemesterId]);

  // Default selection for classroom and student
  useEffect(() => {
    if (classrooms.length > 0 && !selectedClassroomId) {
      setSelectedClassroomId(classrooms[0].id);
    }
  }, [classrooms, selectedClassroomId]);

  useEffect(() => {
    if (students.length > 0) {
      // If current selected student is not in the new class, select first
      const exists = students.some((s) => s.id === selectedStudentId);
      if (!exists) {
        setSelectedStudentId(students[0].id);
      }
    } else {
      setSelectedStudentId("");
    }
  }, [students, selectedStudentId]);

  // Query Report Card
  const {
    data: report,
    isLoading: isLoadingReport,
    isError: isErrorReport,
    error: reportError,
    refetch,
  } = useStudentReportCard(
    selectedStudentId || undefined,
    selectedSemesterId || undefined,
    { includeTahfidz, includeAttendance }
  );

  // Sync edit notes modal with current report data
  const handleOpenNotesModal = () => {
    if (report) {
      setTeacherNotes(report.notes?.teacherNotes || "");
      setSpiritualAttitude(report.notes?.spiritualAttitude || "");
      setSocialAttitude(report.notes?.socialAttitude || "");
      setExtracurriculars(
        report.notes?.extracurriculars && report.notes.extracurriculars.length > 0
          ? [...report.notes.extracurriculars]
          : [{ name: "", score: "Baik", description: "" }]
      );
      setAchievements(
        report.notes?.achievements && report.notes.achievements.length > 0
          ? [...report.notes.achievements]
          : [{ description: "", type: "Akademik" }]
      );
    }
    setIsNotesModalOpen(true);
  };

  const downloadPdfMutation = useDownloadReportPdf();
  const saveNotesMutation = useSaveStudentNotes();

  const handleDownloadPdf = async () => {
    if (!selectedStudentId || !selectedSemesterId) return;
    const studentName = report?.student?.fullName?.replace(/\s+/g, "_") || "siswa";
    const filename = `Rapor_${studentName}_${selectedSemesterId.slice(0, 8)}.pdf`;
    await downloadPdfMutation.mutateAsync({
      studentId: selectedStudentId,
      semesterId: selectedSemesterId,
      filename,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedSemesterId) return;

    // Filter valid entries
    const validExtracurriculars = extracurriculars.filter((item) => item.name.trim().length > 0);
    const validAchievements = achievements.filter((item) => item.description.trim().length > 0);

    await saveNotesMutation.mutateAsync({
      studentId: selectedStudentId,
      data: {
        semesterId: selectedSemesterId,
        classroomId: selectedClassroomId || undefined,
        teacherNotes: teacherNotes.trim() || "Tingkatkan terus prestasi dan semangat belajarmu.",
        spiritualAttitude: spiritualAttitude.trim(),
        socialAttitude: socialAttitude.trim(),
        extracurriculars: validExtracurriculars,
        achievements: validAchievements,
      },
    });

    setIsNotesModalOpen(false);
    refetch();
  };

  // Group grades by subject group (Kelompok A, Kelompok B, dll)
  const groupedGrades = React.useMemo(() => {
    if (!report?.grades) return {};
    const groups: Record<string, typeof report.grades> = {};
    report.grades.forEach((g) => {
      const grp = g.group || "Umum";
      if (!groups[grp]) groups[grp] = [];
      groups[grp].push(g);
    });
    return groups;
  }, [report?.grades]);

  return (
    <div className="space-y-4">
      {/* 1. COMPACT FILTER TOOLBAR (Screen Only) */}
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
            label="Peserta Didik (Siswa)"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            disabled={isLoadingStudents || students.length === 0}
            options={[
              {
                value: "",
                label: students.length === 0 ? "-- Tidak ada siswa di kelas ini --" : "-- Pilih Siswa --",
              },
              ...students.map((s) => ({
                value: s.id,
                label: `${s.fullName} ${s.nisn ? `(${s.nisn})` : ""}`,
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

          <div className="flex flex-col justify-end">
            <span className="text-xs font-semibold text-slate-700 mb-1">Opsi Tambahan</span>
            <div className="flex items-center space-x-4 h-9">
              <label className="inline-flex items-center text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTahfidz}
                  onChange={(e) => setIncludeTahfidz(e.target.checked)}
                  className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 mr-1.5"
                />
                Tahfidz
              </label>
              <label className="inline-flex items-center text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAttendance}
                  onChange={(e) => setIncludeAttendance(e.target.checked)}
                  className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 mr-1.5"
                />
                Presensi
              </label>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        {report && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Menampilkan Rapor:{" "}
              <span className="font-semibold text-slate-800">{report.student.fullName}</span>
              <span className="text-slate-400">|</span>
              NISN: <span className="font-mono text-slate-700">{report.student.nisn || "-"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenNotesModal}
                className="gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                Catatan & Sikap
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                Cetak Rapor
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDownloadPdf}
                isLoading={downloadPdfMutation.isPending}
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 2. MAIN WORKSPACE / PREVIEW (Screen Only) */}
      <div className="print:hidden space-y-4">
        {/* Loading State */}
        {isLoadingReport && (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-medium text-slate-700">Memuat Buku Rapor Siswa...</p>
            <p className="text-xs text-slate-400 mt-1">Mengambil data nilai, kehadiran, dan catatan semester</p>
          </div>
        )}

        {/* Empty / Not Selected State */}
        {!isLoadingReport && !report && !isErrorReport && (
          <div className="bg-white rounded-lg border border-slate-200 p-10 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Pilih Siswa dan Semester</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Gunakan bilah filter di atas untuk memilih rombel kelas, siswa, dan semester yang ingin ditampilkan buku rapornya.
            </p>
          </div>
        )}

        {/* Error State */}
        {isErrorReport && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-800">Gagal Mengambil Data Rapor</h4>
              <p className="text-xs text-red-700 mt-0.5">
                {(reportError as Error)?.message || "Terjadi kesalahan saat memuat rapor siswa."}
              </p>
            </div>
          </div>
        )}

        {/* Populated Report Content */}
        {report && (
          <>
            {/* Student Summary Card */}
            <Card className="bg-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-medium">Nama Peserta Didik</span>
                  <p className="text-sm font-bold text-slate-900 leading-tight">{report.student.fullName}</p>
                  <p className="text-xs text-slate-500 font-mono">
                    NISN: {report.student.nisn || "-"} / NIS: {report.student.nis || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-medium">Madrasah & Kelas</span>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {report.classroom.name} (Tingkat {report.classroom.gradeLevel})
                  </p>
                  <p className="text-xs text-slate-500">
                    Wali Kelas: {report.classroom.homeroomTeacher?.fullName || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-medium">Periode Akademik</span>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {formatSemesterType(report.semester.type)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Tahun Ajaran {report.academicYear.name}
                  </p>
                </div>

                <div className="space-y-1 bg-emerald-50/60 p-2.5 rounded-md border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-emerald-800 uppercase font-semibold">Capaian Kelas</span>
                    {report.summary.rankInClass && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-sm bg-emerald-600 text-white">
                        Rank #{report.summary.rankInClass}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-lg font-bold text-emerald-700">
                      {report.summary.averageScore.toFixed(1)}
                    </span>
                    <span className="text-xs text-emerald-600">
                      Rata-rata (Total: {report.summary.totalScore.toFixed(0)})
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Grades Table */}
            <Card header="Capaian Hasil Belajar (Nilai Akhir & Predikat)">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3">Mata Pelajaran</th>
                      <th className="py-2.5 px-3 w-24 text-center">Nilai Akhir</th>
                      <th className="py-2.5 px-3 w-24 text-center">Predikat</th>
                      <th className="py-2.5 px-4">Deskripsi Capaian Kompetensi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(groupedGrades).map(([groupName, groupItems]) => (
                      <React.Fragment key={groupName}>
                        <tr className="bg-slate-100/70 font-semibold text-slate-700">
                          <td colSpan={5} className="py-1.5 px-3 text-[11px]">
                            Kelompok: {groupName}
                          </td>
                        </tr>
                        {groupItems.map((g, idx) => (
                          <tr key={g.subjectId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-800">
                              <div>{g.subjectName}</div>
                              <span className="text-[10px] text-slate-400 font-mono">{g.subjectCode}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-900 text-sm">
                              {g.finalScore.toFixed(0)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs ${getLetterGradeBadgeClass(
                                  g.letterGrade
                                )}`}
                              >
                                {g.letterGrade}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-600 leading-relaxed text-[11.5px]">
                              {g.description || "Telah mencapai kompetensi dengan baik."}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                    {report.grades.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                          Belum ada nilai semester yang dikalkulasi untuk siswa ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Attendance & Tahfidz Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Attendance Card */}
              <Card header="Rekapitulasi Kehadiran Siswa">
                <div className="grid grid-cols-4 gap-2 text-center mb-3">
                  <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 uppercase font-semibold block">Hadir</span>
                    <span className="text-base font-bold text-emerald-700">{report.attendance?.hadir ?? 0}</span>
                    <span className="text-[10px] text-emerald-600 block">Hari</span>
                  </div>
                  <div className="p-2.5 rounded-md bg-amber-50 border border-amber-100">
                    <span className="text-[10px] text-amber-800 uppercase font-semibold block">Sakit (S)</span>
                    <span className="text-base font-bold text-amber-700">{report.attendance?.sakit ?? 0}</span>
                    <span className="text-[10px] text-amber-600 block">Hari</span>
                  </div>
                  <div className="p-2.5 rounded-md bg-blue-50 border border-blue-100">
                    <span className="text-[10px] text-blue-800 uppercase font-semibold block">Izin (I)</span>
                    <span className="text-base font-bold text-blue-700">{report.attendance?.izin ?? 0}</span>
                    <span className="text-[10px] text-blue-600 block">Hari</span>
                  </div>
                  <div className="p-2.5 rounded-md bg-rose-50 border border-rose-100">
                    <span className="text-[10px] text-rose-800 uppercase font-semibold block">Alpa (A)</span>
                    <span className="text-base font-bold text-rose-700">{report.attendance?.alpa ?? 0}</span>
                    <span className="text-[10px] text-rose-600 block">Hari</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 px-1 pt-1 border-t border-slate-100">
                  <span>Persentase Kehadiran:</span>
                  <span className="font-bold text-emerald-700">
                    {report.attendance?.percentage !== undefined ? `${report.attendance.percentage}%` : "100%"}
                  </span>
                </div>
              </Card>

              {/* Tahfidz Card */}
              <Card header="Capaian Tahfidz & Tasmi' Al-Qur'an">
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 uppercase font-semibold block">Total Juz</span>
                    <span className="text-base font-bold text-emerald-700">{report.tahfidz?.totalJuz ?? 0}</span>
                    <span className="text-[10px] text-emerald-600 block">Juz</span>
                  </div>
                  <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-700 uppercase font-semibold block">Setoran</span>
                    <span className="text-base font-bold text-slate-800">{report.tahfidz?.recordsCount ?? 0}</span>
                    <span className="text-[10px] text-slate-500 block">Riwayat</span>
                  </div>
                  <div className="p-2.5 rounded-md bg-sky-50 border border-sky-100">
                    <span className="text-[10px] text-sky-800 uppercase font-semibold block">Tasmi' Lulus</span>
                    <span className="text-base font-bold text-sky-700">{report.tahfidz?.passedExamsCount ?? 0}</span>
                    <span className="text-[10px] text-sky-600 block">Ujian</span>
                  </div>
                </div>
                <div className="text-xs text-slate-600 px-1 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span>Setoran Surah Terakhir:</span>
                  <span className="font-semibold text-slate-800">
                    {report.tahfidz?.lastSurah || "Belum ada setoran"}
                  </span>
                </div>
              </Card>
            </div>

            {/* Extracurriculars & Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Extracurriculars */}
              <Card header="Kegiatan Ekstrakurikuler">
                {report.notes?.extracurriculars && report.notes.extracurriculars.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {report.notes.extracurriculars.map((ekskul, idx) => (
                      <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-start justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-800">{ekskul.name}</p>
                          {ekskul.description && (
                            <p className="text-slate-500 text-[11px]">{ekskul.description}</p>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-medium">
                          {ekskul.score || "Baik"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    Belum ada catatan kegiatan ekstrakurikuler.
                  </p>
                )}
              </Card>

              {/* Achievements */}
              <Card header="Prestasi Siswa">
                {report.notes?.achievements && report.notes.achievements.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {report.notes.achievements.map((ach, idx) => (
                      <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-start gap-2 text-xs">
                        <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">{ach.description}</p>
                          <span className="text-[10px] text-slate-400 uppercase">{ach.type || "Akademik"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    Belum ada catatan prestasi yang dicapai pada semester ini.
                  </p>
                )}
              </Card>
            </div>

            {/* Attitudes & Teacher Notes */}
            <Card header="Penilaian Sikap & Catatan Wali Kelas">
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <span className="font-semibold text-slate-800 block mb-1">Catatan Wali Kelas:</span>
                  <p className="text-slate-700 leading-relaxed italic">
                    "{report.notes?.teacherNotes || "Tingkatkan terus prestasi dan semangat belajarmu."}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                    <span className="font-semibold text-slate-800 block mb-1">Sikap Spiritual:</span>
                    <p className="text-slate-600 leading-relaxed">
                      {report.notes?.spiritualAttitude || "Menunjukkan ketaatan beribadah dan sikap berdoa dengan sangat baik."}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                    <span className="font-semibold text-slate-800 block mb-1">Sikap Sosial:</span>
                    <p className="text-slate-600 leading-relaxed">
                      {report.notes?.socialAttitude || "Menunjukkan sikap santun, disiplin, peduli, dan tanggung jawab yang baik."}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* 3. FORMAL PRINT LAYOUT (Standard Madrasah RDM - Print Only) */}
      {report && (
        <div className="hidden print:block text-slate-900 bg-white font-serif p-6">
          {/* Official Letterhead / Kop Surat */}
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
            <h2 className="text-sm font-bold tracking-wider uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h2>
            <h1 className="text-base font-extrabold uppercase mt-0.5">{report.institution.name}</h1>
            <p className="text-[10px] text-slate-700 mt-0.5">{report.institution.address}</p>
            <p className="text-[10px] text-slate-700">
              NSM: {report.institution.nsm} | NPSN: {report.institution.npsn}
            </p>
          </div>

          {/* Document Title */}
          <div className="text-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wide">
              LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPOR)
            </h3>
          </div>

          {/* Student & School Metadata */}
          <div className="grid grid-cols-2 gap-4 text-[10.5px] mb-4">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="w-28 py-0.5">Nama Peserta Didik</td>
                  <td className="w-3">:</td>
                  <td className="font-bold">{report.student.fullName}</td>
                </tr>
                <tr>
                  <td className="py-0.5">NISN / NIS</td>
                  <td>:</td>
                  <td>{report.student.nisn || "-"} / {report.student.nis || "-"}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Tempat, Tgl Lahir</td>
                  <td>:</td>
                  <td>{report.student.birthPlace}, {report.student.birthDate}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Jenis Kelamin</td>
                  <td>:</td>
                  <td>{report.student.gender === "L" ? "Laki-laki" : "Perempuan"}</td>
                </tr>
              </tbody>
            </table>

            <table className="w-full">
              <tbody>
                <tr>
                  <td className="w-28 py-0.5">Madrasah</td>
                  <td className="w-3">:</td>
                  <td>{report.institution.name}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Kelas / Semester</td>
                  <td>:</td>
                  <td>{report.classroom.name} / {formatSemesterType(report.semester.type)}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Tahun Pelajaran</td>
                  <td>:</td>
                  <td>{report.academicYear.name}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Wali Kelas</td>
                  <td>:</td>
                  <td>{report.classroom.homeroomTeacher?.fullName || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table Capaian Hasil Belajar */}
          <div className="mb-4">
            <h4 className="text-[11px] font-bold mb-1">A. Capaian Kompetensi Hasil Belajar</h4>
            <table className="w-full border-collapse border border-slate-900 text-[10px]">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-900">
                  <th className="border border-slate-900 py-1.5 px-2 w-8 text-center">No</th>
                  <th className="border border-slate-900 py-1.5 px-2">Mata Pelajaran</th>
                  <th className="border border-slate-900 py-1.5 px-2 w-14 text-center">Nilai</th>
                  <th className="border border-slate-900 py-1.5 px-2 w-14 text-center">Predikat</th>
                  <th className="border border-slate-900 py-1.5 px-2">Capaian Kompetensi</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedGrades).map(([grp, items]) => (
                  <React.Fragment key={grp}>
                    <tr className="font-bold bg-slate-50">
                      <td colSpan={5} className="border border-slate-900 py-1 px-2">
                        Kelompok: {grp}
                      </td>
                    </tr>
                    {items.map((it, idx) => (
                      <tr key={it.subjectId}>
                        <td className="border border-slate-900 py-1 px-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-900 py-1 px-2 font-medium">{it.subjectName}</td>
                        <td className="border border-slate-900 py-1 px-2 text-center font-bold">
                          {it.finalScore.toFixed(0)}
                        </td>
                        <td className="border border-slate-900 py-1 px-2 text-center font-bold">{it.letterGrade}</td>
                        <td className="border border-slate-900 py-1 px-2 leading-tight">{it.description}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Ekstrakurikuler & Kehadiran */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-[10px]">
            <div>
              <h4 className="text-[11px] font-bold mb-1">B. Kegiatan Ekstrakurikuler</h4>
              <table className="w-full border-collapse border border-slate-900">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-900">
                    <th className="border border-slate-900 py-1 px-2 w-8 text-center">No</th>
                    <th className="border border-slate-900 py-1 px-2">Kegiatan</th>
                    <th className="border border-slate-900 py-1 px-2 w-16 text-center">Nilai</th>
                    <th className="border border-slate-900 py-1 px-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {report.notes?.extracurriculars && report.notes.extracurriculars.length > 0 ? (
                    report.notes.extracurriculars.map((ek, i) => (
                      <tr key={i}>
                        <td className="border border-slate-900 py-1 px-2 text-center">{i + 1}</td>
                        <td className="border border-slate-900 py-1 px-2">{ek.name}</td>
                        <td className="border border-slate-900 py-1 px-2 text-center">{ek.score || "Baik"}</td>
                        <td className="border border-slate-900 py-1 px-2">{ek.description || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="border border-slate-900 py-2 text-center italic">
                        - Tidak ada catatan -
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="text-[11px] font-bold mb-1">C. Ketidakhadiran</h4>
              <table className="w-full border-collapse border border-slate-900">
                <tbody>
                  <tr>
                    <td className="border border-slate-900 py-1 px-2 w-32">Sakit (S)</td>
                    <td className="border border-slate-900 py-1 px-2 text-center font-bold">
                      {report.attendance?.sakit ?? 0} hari
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 py-1 px-2">Izin (I)</td>
                    <td className="border border-slate-900 py-1 px-2 text-center font-bold">
                      {report.attendance?.izin ?? 0} hari
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 py-1 px-2">Tanpa Keterangan (A)</td>
                    <td className="border border-slate-900 py-1 px-2 text-center font-bold">
                      {report.attendance?.alpa ?? 0} hari
                    </td>
                  </tr>
                </tbody>
              </table>

              {report.tahfidz && (
                <div className="mt-2 text-[9.5px]">
                  <span className="font-bold">Capaian Tahfidz:</span> {report.tahfidz.totalJuz} Juz dihafal (Ujian Tasmi' Lulus: {report.tahfidz.passedExamsCount})
                </div>
              )}
            </div>
          </div>

          {/* Notes & Attitudes */}
          <div className="border border-slate-900 p-2 mb-6 text-[10px]">
            <h4 className="font-bold mb-1">D. Catatan Wali Kelas:</h4>
            <p className="italic mb-2">"{report.notes?.teacherNotes || "Tingkatkan terus prestasi dan semangat belajarmu."}"</p>
            {report.notes?.spiritualAttitude && (
              <p className="mb-1"><span className="font-semibold">Sikap Spiritual:</span> {report.notes.spiritualAttitude}</p>
            )}
            {report.notes?.socialAttitude && (
              <p><span className="font-semibold">Sikap Sosial:</span> {report.notes.socialAttitude}</p>
            )}
          </div>

          {/* Validation & Signatures */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] mt-6">
            <div>
              <p>Mengetahui,</p>
              <p>Orang Tua / Wali Siswa</p>
              <div className="h-16" />
              <p className="font-bold border-b border-slate-900 inline-block min-w-32">
                ..........................................
              </p>
            </div>

            <div>
              <p>&nbsp;</p>
              <p>Wali Kelas</p>
              <div className="h-16" />
              <p className="font-bold border-b border-slate-900 inline-block min-w-32">
                {report.classroom.homeroomTeacher?.fullName || "...................................."}
              </p>
              {report.classroom.homeroomTeacher?.nuptk && (
                <p className="text-[9px]">NUPTK: {report.classroom.homeroomTeacher.nuptk}</p>
              )}
            </div>

            <div>
              <p>Diberikan di, .........................</p>
              <p>Kepala Madrasah</p>
              <div className="h-16" />
              <p className="font-bold border-b border-slate-900 inline-block min-w-32">
                ..........................................
              </p>
              <p className="text-[9px]">NIP / NSM: {report.institution.nsm}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL EDIT CATATAN & SIKAP WALI KELAS */}
      <Modal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        title={`Catatan & Penilaian Sikap - ${report?.student.fullName || ""}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveNotes} className="space-y-4 text-xs">
          {/* Catatan Wali Kelas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Wali Kelas <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Tuliskan catatan motivasi, perkembangan belajar, dan saran bagi peserta didik..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:border-emerald-600 focus:ring-emerald-600"
            />
          </div>

          {/* Sikap Spiritual */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sikap Spiritual
            </label>
            <textarea
              rows={2}
              value={spiritualAttitude}
              onChange={(e) => setSpiritualAttitude(e.target.value)}
              placeholder="Deskripsi capaian sikap spiritual (ketaatan ibadah, doa, toleransi)..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:border-emerald-600 focus:ring-emerald-600"
            />
          </div>

          {/* Sikap Sosial */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sikap Sosial
            </label>
            <textarea
              rows={2}
              value={socialAttitude}
              onChange={(e) => setSocialAttitude(e.target.value)}
              placeholder="Deskripsi capaian sikap sosial (kejujuran, disiplin, santun, gotong royong)..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:border-emerald-600 focus:ring-emerald-600"
            />
          </div>

          {/* Ekstrakurikuler Builder */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-800">Kegiatan Ekstrakurikuler</span>
              <button
                type="button"
                onClick={() =>
                  setExtracurriculars((prev) => [
                    ...prev,
                    { name: "", score: "Baik", description: "" },
                  ])
                }
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Ekstrakurikuler
              </button>
            </div>

            <div className="space-y-2">
              {extracurriculars.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const updated = [...extracurriculars];
                      updated[idx].name = e.target.value;
                      setExtracurriculars(updated);
                    }}
                    placeholder="Nama ekskul (e.g. Pramuka, PMR)"
                    className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  />
                  <select
                    value={item.score || "Baik"}
                    onChange={(e) => {
                      const updated = [...extracurriculars];
                      updated[idx].score = e.target.value;
                      setExtracurriculars(updated);
                    }}
                    className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs bg-white"
                  >
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Baik">Baik</option>
                    <option value="Cukup">Cukup</option>
                  </select>
                  <input
                    type="text"
                    value={item.description || ""}
                    onChange={(e) => {
                      const updated = [...extracurriculars];
                      updated[idx].description = e.target.value;
                      setExtracurriculars(updated);
                    }}
                    placeholder="Keterangan singkat"
                    className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setExtracurriculars((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {extracurriculars.length === 0 && (
                <p className="text-[11px] text-slate-400 italic">Belum ada baris ekstrakurikuler.</p>
              )}
            </div>
          </div>

          {/* Prestasi Builder */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-800">Prestasi Siswa</span>
              <button
                type="button"
                onClick={() =>
                  setAchievements((prev) => [
                    ...prev,
                    { description: "", type: "Akademik" },
                  ])
                }
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Prestasi
              </button>
            </div>

            <div className="space-y-2">
              {achievements.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={item.type || "Akademik"}
                    onChange={(e) => {
                      const updated = [...achievements];
                      updated[idx].type = e.target.value;
                      setAchievements(updated);
                    }}
                    className="w-32 rounded-md border border-slate-300 px-2 py-1 text-xs bg-white"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Non-Akademik">Non-Akademik</option>
                    <option value="Keagamaan">Keagamaan</option>
                    <option value="Seni / Olahraga">Seni / Olahraga</option>
                  </select>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...achievements];
                      updated[idx].description = e.target.value;
                      setAchievements(updated);
                    }}
                    placeholder="Uraian prestasi (e.g. Juara 1 KSM Matematika)"
                    className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAchievements((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {achievements.length === 0 && (
                <p className="text-[11px] text-slate-400 italic">Belum ada baris prestasi.</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNotesModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saveNotesMutation.isPending}
            >
              Simpan Catatan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
