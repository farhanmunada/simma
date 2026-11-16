import React, { useState } from "react";
import { Info, CheckCircle2, AlertTriangle } from "lucide-react";
import { useTeacherWorkloads, useUpsertTeacherWorkload } from "../api/teachers.api";
import { WorkloadRecapTable } from "../components/WorkloadRecapTable";
import { WorkloadModal } from "../components/WorkloadModal";
import type { WorkloadSummaryDto } from "../types";

export const TeacherWorkloadPage: React.FC = () => {
  const [selectedWorkload, setSelectedWorkload] = useState<WorkloadSummaryDto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: workloads = [], isLoading } = useTeacherWorkloads();
  const upsertMutation = useUpsertTeacherWorkload();

  const handleEditWorkload = (item: WorkloadSummaryDto) => {
    setSelectedWorkload(item);
    setModalOpen(true);
  };

  const handleSubmitWorkload = async (formData: any) => {
    // Default academicYearId and semesterId if not provided
    await upsertMutation.mutateAsync({
      teacherId: formData.teacherId,
      academicYearId: "00000000-0000-0000-0000-000000000001",
      semesterId: "00000000-0000-0000-0000-000000000001",
      teachingJtm: formData.teachingJtm,
      additionalDutyType: formData.additionalDutyType,
      additionalDutyJtm: formData.additionalDutyJtm,
    });
  };

  const eligibleCount = workloads.filter((w) => w.totalJtm >= 24).length;
  const underLimitCount = workloads.length - eligibleCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Beban Kerja Guru (24 JTM Simpatika)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitoring pemenuhan jam tatap muka pokok dan ekuivalensi tugas tambahan madrasah.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Total Terdata</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{workloads.length} Guru</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Info className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Memenuhi Syarat TPG</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{eligibleCount} Guru</h3>
            <p className="text-xs text-emerald-600 mt-0.5">≥ 24 Jam Tatap Muka</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Beban Kurang (&lt; 24 JTM)</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{underLimitCount} Guru</h3>
            <p className="text-xs text-amber-600 mt-0.5">Perlu tugas tambahan / Linier</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong>Ketentuan Regulasi Simpatika Kemenag:</strong> Guru penerima Tunjangan Profesi Guru
          (TPG) wajib memenuhi beban kerja minimal 24 Jam Tatap Muka (JTM) per minggu dan maksimal 40 JTM.
          Tugas tambahan struktural (Waka, Wali Kelas, Kepala Lab/Perpustakaan) diakui sebagai ekuivalensi jam tatap muka.
        </p>
      </div>

      <WorkloadRecapTable
        items={workloads}
        isLoading={isLoading}
        onEditWorkload={handleEditWorkload}
      />

      <WorkloadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitWorkload}
        workloadItem={selectedWorkload}
      />
    </div>
  );
};
