import React, { useState } from "react";
import { FileCheck } from "lucide-react";
import { useEmisAudit } from "../api/emis.api";
import { useAuthStore } from "../../../stores/auth.store";
import { AuditReadinessCard } from "../components/AuditReadinessCard";
import { ExportCenterCard } from "../components/ExportCenterCard";
import { AuditAnomalyList } from "../components/AuditAnomalyList";
import { BapApprovalModal } from "../components/BapApprovalModal";

export const EmisDashboardPage: React.FC = () => {
  const { data, isLoading, refetch, isRefetching } = useEmisAudit();
  const user = useAuthStore((state) => state.user);
  const [isBapModalOpen, setIsBapModalOpen] = useState(false);

  const summary = data?.summary || {
    overallPercentage: 0,
    isReadyForExport: false,
    students: { total: 0, valid: 0, invalid: 0, percentage: 0 },
    teachers: { total: 0, valid: 0, invalid: 0, percentage: 0 },
    classrooms: { total: 0, valid: 0, invalid: 0, percentage: 0 },
    institution: { total: 0, valid: 0, invalid: 0, percentage: 0 },
  };

  const anomalies = data?.anomalies || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Sinkronisasi & Ekspor EMIS 4.0 Kemenag
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Audit integritas NIK/NISN Dukcapil, agregasi kelembagaan, dan penerbitan BAP resmi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBapModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            <FileCheck className="h-4 w-4" />
            <span>Berita Acara (BAP)</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-emerald-600 font-bold mb-2">Memeriksa Database EMIS...</div>
          <p className="text-xs text-gray-500">
            Mengaudit NIK, NISN, status kepegawaian GTK, dan kelengkapan rombongan belajar.
          </p>
        </div>
      ) : (
        <>
          <AuditReadinessCard
            summary={summary}
            onRefresh={() => refetch()}
            isLoading={isRefetching}
          />

          <ExportCenterCard
            isReadyForExport={summary.isReadyForExport}
            overallPercentage={summary.overallPercentage}
          />

          <AuditAnomalyList anomalies={anomalies} />
        </>
      )}

      <BapApprovalModal
        isOpen={isBapModalOpen}
        onClose={() => setIsBapModalOpen(false)}
        userRole={user?.role}
      />
    </div>
  );
};
