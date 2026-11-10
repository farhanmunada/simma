import React from "react";
import { FileDown, ShieldCheck, AlertCircle, HelpCircle } from "lucide-react";
import type { StudentComplianceSummary, MutabaahComplianceStatus } from "../types";

interface ComplianceTableProps {
  data: StudentComplianceSummary[];
  onDownloadPdf: (studentId: string, studentName: string) => void;
  downloadingId?: string | null;
}

const BADGE_CONFIG: Record<
  MutabaahComplianceStatus,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  istiqamah: {
    label: "Istiqamah (>=80%)",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />,
  },
  perhatian: {
    label: "Perhatian (60-79%)",
    bg: "bg-amber-100",
    text: "text-amber-800",
    icon: <AlertCircle className="h-3.5 w-3.5 text-amber-600" />,
  },
  konseling: {
    label: "Perlu Konseling (<60%)",
    bg: "bg-rose-100",
    text: "text-rose-800",
    icon: <HelpCircle className="h-3.5 w-3.5 text-rose-600" />,
  },
};

export const ComplianceTable: React.FC<ComplianceTableProps> = ({
  data,
  onDownloadPdf,
  downloadingId,
}) => {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
        Belum ada data rekapan kepatuhan pada rentang tanggal ini.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
        <thead className="bg-slate-50 font-semibold text-slate-700">
          <tr>
            <th className="px-4 py-3">Nama Santri</th>
            <th className="px-3 py-3">Kelas</th>
            <th className="px-3 py-3 text-center">Wajib</th>
            <th className="px-3 py-3 text-center text-emerald-700">Terlaksana</th>
            <th className="px-3 py-3 text-center text-amber-700">Masbuk</th>
            <th className="px-3 py-3 text-center text-purple-700">Uzur</th>
            <th className="px-3 py-3 text-center text-rose-700">Lalai</th>
            <th className="px-4 py-3 text-center">Skor Kepatuhan</th>
            <th className="px-3 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-center">Rapor PDF</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {data.map((row) => {
            const badge = BADGE_CONFIG[row.status];
            const isDownloading = downloadingId === row.studentId;

            return (
              <tr key={row.studentId} className="hover:bg-slate-50/70 transition">
                <td className="px-4 py-3 font-medium text-slate-900">
                  <div className="flex items-center gap-1.5">
                    <span>{row.studentName}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        row.gender === "P"
                          ? "bg-pink-100 text-pink-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {row.gender === "P" ? "P" : "L"}
                    </span>
                  </div>
                  {row.nisn && <div className="text-[10px] text-slate-600">NISN: {row.nisn}</div>}
                </td>

                <td className="px-3 py-3 text-slate-600">{row.className || "-"}</td>

                <td className="px-3 py-3 text-center font-semibold text-slate-700">
                  {row.totalMandatoryActivities}
                </td>

                <td className="px-3 py-3 text-center font-bold text-emerald-600">
                  {row.completedActivities}
                </td>

                <td className="px-3 py-3 text-center font-medium text-amber-600">
                  {row.masbukActivities}
                </td>

                <td className="px-3 py-3 text-center font-medium text-purple-600">
                  {row.uzurActivities}
                </td>

                <td className="px-3 py-3 text-center font-bold text-rose-600">
                  {row.missedActivities}
                </td>

                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-slate-800 text-sm">
                      {row.complianceScore}%
                    </span>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full ${
                          row.complianceScore >= 80
                            ? "bg-emerald-600"
                            : row.complianceScore >= 60
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(row.complianceScore, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.bg} ${badge.text}`}
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={() => onDownloadPdf(row.studentId, row.studentName)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 transition"
                    title="Unduh Lembar Rekap Rapor Mutaba'ah PDF"
                  >
                    <FileDown className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{isDownloading ? "Mengunduh..." : "PDF"}</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
