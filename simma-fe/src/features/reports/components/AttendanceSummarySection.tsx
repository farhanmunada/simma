import React from "react";
import { Card } from "../../../components/ui/Card";
import type { ReportAttendanceSummary, ReportTahfidzSummary } from "../types";

interface AttendanceSummarySectionProps {
  attendance?: ReportAttendanceSummary;
  tahfidz?: ReportTahfidzSummary;
}

export const AttendanceSummarySection: React.FC<AttendanceSummarySectionProps> = ({
  attendance,
  tahfidz,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Attendance Card */}
      <Card header="Rekapitulasi Kehadiran Siswa">
        <div className="grid grid-cols-4 gap-2 text-center mb-3">
          <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-100">
            <span className="text-[10px] text-emerald-800 uppercase font-semibold block">Hadir</span>
            <span className="text-base font-bold text-emerald-700">{attendance?.hadir ?? 0}</span>
            <span className="text-[10px] text-emerald-600 block">Hari</span>
          </div>
          <div className="p-2.5 rounded-md bg-amber-50 border border-amber-100">
            <span className="text-[10px] text-amber-800 uppercase font-semibold block">Sakit (S)</span>
            <span className="text-base font-bold text-amber-700">{attendance?.sakit ?? 0}</span>
            <span className="text-[10px] text-amber-600 block">Hari</span>
          </div>
          <div className="p-2.5 rounded-md bg-blue-50 border border-blue-100">
            <span className="text-[10px] text-blue-800 uppercase font-semibold block">Izin (I)</span>
            <span className="text-base font-bold text-blue-700">{attendance?.izin ?? 0}</span>
            <span className="text-[10px] text-blue-600 block">Hari</span>
          </div>
          <div className="p-2.5 rounded-md bg-rose-50 border border-rose-100">
            <span className="text-[10px] text-rose-800 uppercase font-semibold block">Alpa (A)</span>
            <span className="text-base font-bold text-rose-700">{attendance?.alpa ?? 0}</span>
            <span className="text-[10px] text-rose-600 block">Hari</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600 px-1 pt-1 border-t border-slate-100">
          <span>Persentase Kehadiran:</span>
          <span className="font-bold text-emerald-700">
            {attendance?.percentage !== undefined ? `${attendance.percentage}%` : "100%"}
          </span>
        </div>
      </Card>

      {/* Tahfidz Card */}
      <Card header="Capaian Tahfidz & Tasmi' Al-Qur'an">
        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-100">
            <span className="text-[10px] text-emerald-800 uppercase font-semibold block">Total Juz</span>
            <span className="text-base font-bold text-emerald-700">{tahfidz?.totalJuz ?? 0}</span>
            <span className="text-[10px] text-emerald-600 block">Juz</span>
          </div>
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-700 uppercase font-semibold block">Setoran</span>
            <span className="text-base font-bold text-slate-800">{tahfidz?.recordsCount ?? 0}</span>
            <span className="text-[10px] text-slate-500 block">Riwayat</span>
          </div>
          <div className="p-2.5 rounded-md bg-sky-50 border border-sky-100">
            <span className="text-[10px] text-sky-800 uppercase font-semibold block">Tasmi' Lulus</span>
            <span className="text-base font-bold text-sky-700">{tahfidz?.passedExamsCount ?? 0}</span>
            <span className="text-[10px] text-sky-600 block">Ujian</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600 px-1 pt-1 border-t border-slate-100">
          <span>Surah Terakhir Disimak:</span>
          <span className="font-bold text-slate-800 font-serif">
            {tahfidz?.lastSurah || "-"}
          </span>
        </div>
      </Card>
    </div>
  );
};
