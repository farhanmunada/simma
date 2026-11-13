import React, { useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Users, Download, FileText, BarChart2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { Badge } from "../../../components/ui/Badge";
import { StudentReportModal } from "./StudentReportModal";
import {
  useP5raProjectDetail,
  useP5raRecap,
  useP5raAssessments,
  downloadStudentP5raPdf,
} from "../api/p5ra.api";

export const RecapOverviewPage: React.FC = () => {
  const { projectId = "" } = useParams<{ projectId: string }>();
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [activeReportStudentId, setActiveReportStudentId] = useState<string | null>(null);
  const [downloadingStudentId, setDownloadingStudentId] = useState<string | null>(null);

  const { data: project } = useP5raProjectDetail(projectId);
  const { data: recap } = useP5raRecap(
    projectId,
    selectedClassroomId || undefined
  );
  const { data: studentRows = [] } = useP5raAssessments(
    projectId,
    selectedClassroomId || undefined
  );

  const handleDownloadPdf = async (studentId: string, studentName: string) => {
    try {
      setDownloadingStudentId(studentId);
      const blob = await downloadStudentP5raPdf(projectId, studentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Rapor-P5RA-${studentName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal mengunduh rapor PDF:", err);
    } finally {
      setDownloadingStudentId(null);
    }
  };

  const overall = recap?.overallCounts || { MB: 0, SB: 0, BSH: 0, SAB: 0, total: 0 };
  const getPercentage = (count: number) => {
    if (!overall.total) return 0;
    return Math.round((count / overall.total) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link
            to={`/p5ra/${projectId}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Detail Projek
          </Link>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Rekapitulasi Capaian & Rapor P5RA
          </h1>
          <p className="text-xs text-slate-500">
            {project?.title} • Fase {project?.targetFase}
          </p>
        </div>

        {project?.classrooms && project.classrooms.length > 0 && (
          <div className="w-44">
            <Select
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              options={[
                { label: "Semua Rombel", value: "" },
                ...project.classrooms.map((c) => ({ label: c.name, value: c.id })),
              ]}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 block">Total Siswa</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {recap?.totalStudents || 0}
          </span>
        </div>
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
          <span className="text-xs font-semibold text-emerald-800 block">SAB (Sangat Berkembang)</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-emerald-700">{overall.SAB}</span>
            <span className="text-xs text-emerald-600">({getPercentage(overall.SAB)}%)</span>
          </div>
        </div>
        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
          <span className="text-xs font-semibold text-blue-800 block">BSH (Sesuai Harapan)</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-blue-700">{overall.BSH}</span>
            <span className="text-xs text-blue-600">({getPercentage(overall.BSH)}%)</span>
          </div>
        </div>
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100">
          <span className="text-xs font-semibold text-amber-800 block">SB (Sedang Berkembang)</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-amber-700">{overall.SB}</span>
            <span className="text-xs text-amber-600">({getPercentage(overall.SB)}%)</span>
          </div>
        </div>
        <div className="bg-red-50/60 p-4 rounded-xl border border-red-100">
          <span className="text-xs font-semibold text-red-800 block">MB (Mulai Berkembang)</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-red-700">{overall.MB}</span>
            <span className="text-xs text-red-600">({getPercentage(overall.MB)}%)</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Distribusi Predikat per Target Capaian Dimensi
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3">Dimensi & Sub-Elemen</th>
                <th className="p-3 w-28 text-center text-emerald-700">SAB</th>
                <th className="p-3 w-28 text-center text-blue-700">BSH</th>
                <th className="p-3 w-28 text-center text-amber-700">SB</th>
                <th className="p-3 w-28 text-center text-red-700">MB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recap?.targets.map((row, idx) => (
                <tr key={row.target.id} className="hover:bg-slate-50/50">
                  <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-900 block">{row.target.dimension}</span>
                    <span className="text-slate-500 block text-[11px]">{row.target.element} • {row.target.subElement}</span>
                  </td>
                  <td className="p-3 text-center font-bold text-emerald-700">{row.counts.SAB}</td>
                  <td className="p-3 text-center font-bold text-blue-700">{row.counts.BSH}</td>
                  <td className="p-3 text-center font-bold text-amber-700">{row.counts.SB}</td>
                  <td className="p-3 text-center font-bold text-red-700">{row.counts.MB}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Daftar Siswa & Dokumen Rapor P5RA ({studentRows.length})
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3">Nama Lengkap</th>
                <th className="p-3 w-32">NISN / NIS</th>
                <th className="p-3 w-28">Kelas</th>
                <th className="p-3 w-36 text-center">Status Nilai</th>
                <th className="p-3 w-48 text-right">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentRows.map((row, idx) => {
                const totalAssessed = row.assessments?.length || 0;
                const totalTargets = recap?.targets.length || 0;
                const isComplete = totalTargets > 0 && totalAssessed >= totalTargets;

                return (
                  <tr key={row.student.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-900">{row.student.fullName}</td>
                    <td className="p-3 text-slate-500">{row.student.nisn || row.student.nis || "-"}</td>
                    <td className="p-3 text-slate-600">{row.classroom?.name || "-"}</td>
                    <td className="p-3 text-center">
                      <Badge variant={isComplete ? "success" : "warning"}>
                        {totalAssessed}/{totalTargets} Target
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveReportStudentId(row.student.id)}
                          className="gap-1 text-[11px] h-7 px-2"
                        >
                          <FileText className="w-3 h-3" />
                          Pratinjau
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleDownloadPdf(row.student.id, row.student.fullName)}
                          isLoading={downloadingStudentId === row.student.id}
                          className="gap-1 text-[11px] h-7 px-2"
                        >
                          <Download className="w-3 h-3" />
                          PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {activeReportStudentId && (
        <StudentReportModal
          isOpen={Boolean(activeReportStudentId)}
          onClose={() => setActiveReportStudentId(null)}
          projectId={projectId}
          studentId={activeReportStudentId}
        />
      )}
    </div>
  );
};
