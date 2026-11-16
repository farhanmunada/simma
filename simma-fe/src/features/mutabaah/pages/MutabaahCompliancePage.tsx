import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Filter, Award, ShieldAlert, HeartHandshake } from "lucide-react";
import { getClassrooms } from "../../settings/api/settings.api";
import {
  useComplianceRecap,
  useEarlyWarnings,
  fetchMonthlyReportPdf,
} from "../api/mutabaah.api";
import { ComplianceTable } from "../components/ComplianceTable";
import { EarlyWarningAlertBanner } from "../components/EarlyWarningAlertBanner";

export const MutabaahCompliancePage: React.FC = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const firstDayOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
  const todayStr = now.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: classrooms = [] } = useQuery({
    queryKey: ["classrooms-list"],
    queryFn: () => getClassrooms(),
  });

  const {
    data: complianceData = [],
    isLoading,
  } = useComplianceRecap({
    startDate,
    endDate,
    classroomId: selectedClassId || undefined,
  });

  const { data: earlyWarnings = [] } = useEarlyWarnings(
    selectedClassId || undefined
  );

  const handleDownloadPdf = async (studentId: string, studentName: string) => {
    try {
      setDownloadingId(studentId);
      const blob = await fetchMonthlyReportPdf(studentId, month, year);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Rapor-Mutabaah-${studentName.replace(/\s+/g, "_")}-${month}-${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengunduh berkas PDF Rapor Mutaba'ah.");
    } finally {
      setDownloadingId(null);
    }
  };

  const totalSantri = complianceData.length;
  const istiqamahCount = complianceData.filter((c) => c.status === "istiqamah").length;
  const perhatianCount = complianceData.filter((c) => c.status === "perhatian").length;
  const konselingCount = complianceData.filter((c) => c.status === "konseling").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Award className="h-5 w-5 text-emerald-600" />
          Monitoring Kepatuhan & Rapor Mutaba&apos;ah
        </h1>
        <p className="text-xs text-slate-500">
          Evaluasi indeks istiqamah santri, dispensasi uzur syar&apos;i, dan cetak lembar amalan
        </p>
      </div>

      <EarlyWarningAlertBanner warnings={earlyWarnings} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Total Santri Dievaluasi</div>
          <div className="mt-1 text-2xl font-bold text-slate-800">{totalSantri}</div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
          <div className="text-xs font-semibold text-emerald-700">Istiqamah (&gt;=80%)</div>
          <div className="mt-1 text-2xl font-bold text-emerald-800">{istiqamahCount}</div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs">
          <div className="text-xs font-semibold text-amber-700">Perhatian (60-79%)</div>
          <div className="mt-1 text-2xl font-bold text-amber-800">{perhatianCount}</div>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-2xs">
          <div className="text-xs font-semibold text-rose-700">Perlu Konseling (&lt;60%)</div>
          <div className="mt-1 text-2xl font-bold text-rose-800">{konselingCount}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500">Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sampai:</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="">Semua Kelas</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
          Memproses rekapan kepatuhan amalan santri...
        </div>
      ) : (
        <ComplianceTable
          data={complianceData}
          onDownloadPdf={handleDownloadPdf}
          downloadingId={downloadingId}
        />
      )}
    </div>
  );
};
