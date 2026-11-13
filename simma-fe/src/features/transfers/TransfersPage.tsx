import React, { useState } from "react";
import {
  TransferStatsCards,
  TransferTable,
  TransferInModal,
  TransferOutModal,
  ClearanceChecklistModal,
  ApprovalModal,
  TransferVerifyModal,
  GraduationTab,
  useTransfers,
  useTransferStats,
} from "./index";
import type { TransferItem } from "./types";
import { ArrowLeftRight, GraduationCap, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/api-client";
import { API_ENDPOINTS } from "../../config/endpoints";

export function TransfersPage() {
  const [activeTab, setActiveTab] = useState<"transfers" | "graduations">("transfers");
  const [isInModalOpen, setIsInModalOpen] = useState(false);
  const [isOutModalOpen, setIsOutModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedForClearance, setSelectedForClearance] = useState<TransferItem | null>(null);
  const [selectedForApproval, setSelectedForApproval] = useState<TransferItem | null>(null);

  const { data: stats, isLoading: statsLoading } = useTransferStats();
  const { data: transfersData, isLoading: transfersLoading } = useTransfers();

  const { data: classroomsData } = useQuery({
    queryKey: ["setup", "classrooms"],
    queryFn: () => apiClient<{ data: Array<{ id: string; name: string }> }>(API_ENDPOINTS.SETUP.CLASSROOMS),
  });

  const { data: academicYearsData } = useQuery({
    queryKey: ["setup", "academic-years"],
    queryFn: () => apiClient<{ data: Array<{ id: string; name: string; isActive?: boolean }> }>(API_ENDPOINTS.SETUP.ACADEMIC_YEARS),
  });

  const { data: studentsData } = useQuery({
    queryKey: ["students", "list"],
    queryFn: () => apiClient<{ data: Array<{ id: string; name: string; nisn?: string | null; classroomName?: string | null }> }>(API_ENDPOINTS.STUDENTS.LIST),
  });

  const classrooms = classroomsData?.data ?? [];
  const academicYears = academicYearsData?.data ?? [];
  const students = studentsData?.data ?? [];
  const activeYear = academicYears.find((y) => y.isActive);

  const handleDownloadPdf = async (item: TransferItem) => {
    try {
      const response = await fetch(`/api/v1/transfers/${item.id}/pdf`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (!response.ok) throw new Error("Gagal mengunduh dokumen mutasi");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SK-Mutasi-${item.referenceNumber || item.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(`/api/v1/transfers/${item.id}/pdf`, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mutasi & Kelulusan Siswa</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pengelolaan mutasi masuk, mutasi keluar 3D clearance, dan pemrosesan alumni madrasah.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVerifyModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Cek Validasi SK
          </button>
          <button
            onClick={() => setIsInModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            Mutasi Masuk
          </button>
          <button
            onClick={() => setIsOutModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm transition-colors"
          >
            Ajukan Mutasi Keluar
          </button>
        </div>
      </div>

      <TransferStatsCards stats={stats} isLoading={statsLoading} />

      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("transfers")}
            className={`inline-flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "transfers"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            Daftar Riwayat Mutasi
          </button>
          <button
            onClick={() => setActiveTab("graduations")}
            className={`inline-flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "graduations"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Kelulusan & Buku Induk Alumni
          </button>
        </nav>
      </div>

      {activeTab === "transfers" ? (
        <TransferTable
          transfers={transfersData?.data ?? []}
          isLoading={transfersLoading}
          onOpenClearance={(t) => setSelectedForClearance(t)}
          onOpenApproval={(t) => setSelectedForApproval(t)}
          onDownloadPdf={handleDownloadPdf}
        />
      ) : (
        <GraduationTab
          academicYears={academicYears}
          currentAcademicYearId={activeYear?.id}
          grade12Students={students}
          classrooms={classrooms}
        />
      )}

      {isInModalOpen && (
        <TransferInModal
          isOpen={isInModalOpen}
          onClose={() => setIsInModalOpen(false)}
          classrooms={classrooms}
          academicYears={academicYears}
        />
      )}
      {isOutModalOpen && (
        <TransferOutModal
          isOpen={isOutModalOpen}
          onClose={() => setIsOutModalOpen(false)}
          students={students}
        />
      )}
      {isVerifyModalOpen && (
        <TransferVerifyModal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} />
      )}
      {selectedForClearance && (
        <ClearanceChecklistModal
          isOpen={!!selectedForClearance}
          transfer={selectedForClearance}
          onClose={() => setSelectedForClearance(null)}
        />
      )}
      {selectedForApproval && (
        <ApprovalModal
          isOpen={!!selectedForApproval}
          transfer={selectedForApproval}
          onClose={() => setSelectedForApproval(null)}
        />
      )}
    </div>
  );
}
