import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Printer,
  Edit3,
  AlertCircle,
  User,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import {
  useStudentReportCard,
  useDownloadReportPdf,
} from "../api/reports.api";
import { useSemesters, useClassrooms, useAcademicYears } from "../../settings/api/settings.api";
import { useStudents } from "../../students/api/students.api";
import { formatSemesterType } from "../utils";
import { ReportCardHeader } from "./ReportCardHeader";
import { AcademicGradesSection } from "./AcademicGradesSection";
import { AttendanceSummarySection } from "./AttendanceSummarySection";
import { ExtracurricularSection } from "./ExtracurricularSection";
import { TeacherNotesSection } from "./TeacherNotesSection";
import { ReportCardPrintLayout } from "./ReportCardPrintLayout";
import { EditNotesModal } from "./EditNotesModal";

export const StudentReportCardPage: React.FC = () => {
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [includeTahfidz, setIncludeTahfidz] = useState<boolean>(true);
  const [includeAttendance, setIncludeAttendance] = useState<boolean>(true);

  // Modal edit notes state
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

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
  } = useStudentReportCard(
    selectedStudentId || undefined,
    selectedSemesterId || undefined,
    { includeTahfidz, includeAttendance }
  );

  const downloadPdfMutation = useDownloadReportPdf();

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
                onClick={() => setIsNotesModalOpen(true)}
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
        {isLoadingReport && (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-medium text-slate-700">Memuat Buku Rapor Siswa...</p>
            <p className="text-xs text-slate-400 mt-1">Mengambil data nilai, kehadiran, dan catatan semester</p>
          </div>
        )}

        {!isLoadingReport && !report && !isErrorReport && (
          <div className="bg-white rounded-lg border border-slate-200 p-10 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Pilih Siswa dan Semester</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Gunakan bilah filter di atas untuk memilih rombel kelas, siswa, dan semester yang ingin ditampilkan buku rapornya.
            </p>
          </div>
        )}

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

        {report && (
          <>
            <ReportCardHeader report={report} />
            <AcademicGradesSection grades={report.grades} />
            <AttendanceSummarySection
              attendance={report.attendance}
              tahfidz={report.tahfidz}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ExtracurricularSection notes={report.notes} />
              <TeacherNotesSection notes={report.notes} />
            </div>
          </>
        )}
      </div>

      {/* 3. FORMAL PRINT LAYOUT (Standard Madrasah RDM - Print Only) */}
      {report && <ReportCardPrintLayout report={report} />}

      {/* 4. MODAL EDIT CATATAN & SIKAP WALI KELAS */}
      {report && (
        <EditNotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          report={report}
          selectedStudentId={selectedStudentId}
          selectedSemesterId={selectedSemesterId}
          selectedClassroomId={selectedClassroomId}
        />
      )}
    </div>
  );
};
