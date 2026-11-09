import React, { useState, useEffect, useMemo } from "react";
import {
  FileSpreadsheet,
  Printer,
  Download,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { useClassroomLegger } from "../api/reports.api";
import { useSemesters, useClassrooms, useAcademicYears } from "../../settings/api/settings.api";
import {
  type LeggerQueryParams,
} from "../types";
import {
  formatSemesterType,
  exportLeggerToCsv,
} from "../utils";
import { LeggerStatsCards } from "./LeggerStatsCards";
import { LeggerTable } from "./LeggerTable";
import { LeggerPrintLayout } from "./LeggerPrintLayout";

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
            <LeggerStatsCards legger={legger} />
            <LeggerTable
              legger={legger}
              filteredStudents={filteredStudents}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </>
        )}
      </div>

      {/* 3. PRINT LAYOUT (Official Madrasah Legger Sheet - Print Only) */}
      {legger && <LeggerPrintLayout legger={legger} />}
    </div>
  );
};
