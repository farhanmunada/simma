import React, { useState } from "react";
import { Download, X, FileSpreadsheet, Check } from "lucide-react";
import type { AttendanceStudent, AttendanceTeacher } from "../types";

export interface AttendanceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: "students" | "teachers";
  startDate: string;
  endDate: string;
  studentRecords: AttendanceStudent[];
  teacherRecords: AttendanceTeacher[];
  classroomMap: Map<string, string>;
  teacherMap: Map<string, string>;
}

export const AttendanceExportModal: React.FC<AttendanceExportModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  startDate,
  endDate,
  studentRecords,
  teacherRecords,
  classroomMap,
  teacherMap,
}) => {
  const [exportScope, setExportScope] = useState<"students" | "teachers">(activeTab);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const escapeCsv = (val: unknown) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleDownload = () => {
    let csvContent = "";
    const lines: string[] = [];

    if (exportScope === "students") {
      lines.push(`REKAPITULASI PRESENSI SISWA - PERIODE ${startDate} s/d ${endDate}`);
      lines.push("");
      lines.push(["No", "Tanggal", "Nama Siswa", "NISN", "Kelas", "Status", "Keterangan", "Pencatat"].map(escapeCsv).join(","));
      studentRecords.forEach((item, idx) => {
        lines.push(
          [
            idx + 1,
            item.date,
            item.student?.fullName || item.studentId,
            item.student?.nisn || "",
            classroomMap.get(item.classroomId) || item.classroom?.name || item.classroomId,
            item.status.toUpperCase(),
            item.note || "",
            item.teacherId ? teacherMap.get(item.teacherId) || item.teacher?.fullName || item.teacherId : "",
          ]
            .map(escapeCsv)
            .join(",")
        );
      });
    } else {
      lines.push(`REKAPITULASI PRESENSI GURU & GTK - PERIODE ${startDate} s/d ${endDate}`);
      lines.push("");
      lines.push(["No", "Tanggal", "Nama Guru/GTK", "NIP", "Status", "Keterangan"].map(escapeCsv).join(","));
      teacherRecords.forEach((item, idx) => {
        lines.push(
          [
            idx + 1,
            item.date,
            item.teacher?.fullName || teacherMap.get(item.teacherId) || item.teacherId,
            item.teacher?.nip || "",
            item.status.toUpperCase(),
            item.note || "",
          ]
            .map(escapeCsv)
            .join(",")
        );
      });
    }

    csvContent = "\uFEFF" + lines.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rekap-presensi-${exportScope}-${startDate}-${endDate}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1200);
  };

  const recordCount = exportScope === "students" ? studentRecords.length : teacherRecords.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800">Ekspor Laporan Presensi</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-2xs font-semibold text-slate-600 mb-1">
              Pilih Lingkup Data
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExportScope("students")}
                className={`py-2 px-3 text-xs font-medium rounded border text-center transition-colors ${
                  exportScope === "students"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Data Siswa ({studentRecords.length})
              </button>
              <button
                type="button"
                onClick={() => setExportScope("teachers")}
                className={`py-2 px-3 text-xs font-medium rounded border text-center transition-colors ${
                  exportScope === "teachers"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Data Guru & GTK ({teacherRecords.length})
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-2xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Format Berkas:</span>
              <span className="font-semibold text-slate-800">CSV (Excel Compatible / UTF-8 BOM)</span>
            </div>
            <div className="flex justify-between">
              <span>Rentang Tanggal:</span>
              <span className="font-semibold text-slate-800">{startDate} s/d {endDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Jumlah Baris:</span>
              <span className="font-semibold text-emerald-700">{recordCount} rekaman</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 rounded font-medium"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={recordCount === 0 || downloadSuccess}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded font-medium text-white transition-colors ${
                downloadSuccess
                  ? "bg-emerald-600"
                  : recordCount === 0
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-emerald-700 hover:bg-emerald-800 shadow-2xs"
              }`}
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Berhasil Diunduh
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" /> Unduh Berkas CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
