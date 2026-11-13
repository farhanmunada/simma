import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Download } from "lucide-react";
import { useP5raStudentReport, downloadStudentP5raPdf } from "../api/p5ra.api";
import type { P5raPredicate } from "@simma/shared";

interface StudentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  studentId: string;
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({
  isOpen,
  onClose,
  projectId,
  studentId,
}) => {
  const { data: report, isLoading } = useP5raStudentReport(projectId, studentId);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const blob = await downloadStudentP5raPdf(projectId, studentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Rapor-P5RA-${report?.student.fullName.replace(/\s+/g, "_") || "Siswa"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal mengunduh rapor PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const getPredicateBadge = (predicate?: P5raPredicate | null) => {
    switch (predicate) {
      case "SAB":
        return <Badge variant="success">SAB (Sangat Berkembang)</Badge>;
      case "BSH":
        return <Badge variant="info">BSH (Berkembang Sesuai Harapan)</Badge>;
      case "SB":
        return <Badge variant="warning">SB (Sedang Berkembang)</Badge>;
      case "MB":
        return <Badge variant="danger">MB (Mulai Berkembang)</Badge>;
      default:
        return <Badge variant="neutral">Belum Dinilai</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pratinjau Rapor Projek Profil Pelajar Pancasila & Rahmatan Lil 'Alamin"
      maxWidth="2xl"
    >
      {isLoading || !report ? (
        <div className="py-12 text-center text-sm text-slate-500">
          Memuat data rapor siswa...
        </div>
      ) : (
        <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Nama Siswa</span>
              <span className="font-bold text-slate-900">{report.student.fullName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">NISN / NIS</span>
              <span className="font-semibold text-slate-800">
                {report.student.nisn || "-"} / {report.student.nis || "-"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Kelas / Fase</span>
              <span className="font-semibold text-slate-800">
                {report.classroom.name} (Fase {report.project.targetFase})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Tahun / Semester</span>
              <span className="font-semibold text-slate-800">
                {report.academicYear.name} - Sem {report.semester.type === 1 ? "Ganjil" : "Genap"}
              </span>
            </div>
          </div>

          <div className="border border-emerald-100 bg-emerald-50/50 rounded-lg p-3.5">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
              {report.project.title}
            </h4>
            <p className="text-xs text-emerald-800 mt-1">{report.project.description}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Pencapaian Dimensi & Elemen
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Dimensi & Sub-Elemen</th>
                    <th className="p-2.5">Target Capaian</th>
                    <th className="p-2.5 text-center w-40">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.targetsWithAssessment.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="p-2.5 align-top">
                        <span className="font-semibold text-slate-900 block">
                          {item.target.dimension}
                        </span>
                        <span className="text-slate-500 block mt-0.5">
                          {item.target.element} • {item.target.subElement}
                        </span>
                        {item.target.valuePra && (
                          <span className="text-[11px] text-emerald-700 block mt-1">
                            PRA: {item.target.valuePra}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 align-top text-slate-600 leading-relaxed">
                        {item.target.targetDescription}
                      </td>
                      <td className="p-2.5 align-top text-center">
                        {getPredicateBadge(item.assessment?.predicate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {report.processNotes && (
            <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                Catatan Proses & Perkembangan
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {report.processNotes.processNotes}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Dicetak pada: {report.dateGenerated}
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Tutup
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={handleDownloadPdf}
                isLoading={isDownloading}
              >
                <Download className="w-3.5 h-3.5" />
                Unduh PDF Rapor
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
