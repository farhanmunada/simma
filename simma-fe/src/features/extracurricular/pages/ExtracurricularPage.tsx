import React, { useState } from "react";
import { Award, Users, FileCheck2 } from "lucide-react";
import {
  useExtracurricularStats,
  useExtracurriculars,
  useCreateExtracurricular,
  useUpdateExtracurricular,
  useDeleteExtracurricular,
  useExtracurricularMembers,
  useRegisterExtracurricularMember,
  useDeleteExtracurricularMember,
  useBatchUpsertExtracurricularGrades,
} from "../api/extracurricular.api";
import { ExtracurricularStatsCards } from "../components/ExtracurricularStatsCards";
import { ExtracurricularTable } from "../components/ExtracurricularTable";
import { ExtracurricularFormModal } from "../components/ExtracurricularFormModal";
import { ExtracurricularMembersTab } from "../components/ExtracurricularMembersTab";
import { ExtracurricularGradesTab } from "../components/ExtracurricularGradesTab";
import type { ExtracurricularItem, ExtracurricularTab } from "../types";

export const ExtracurricularPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ExtracurricularTab>("master");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExtracurricularItem | null>(null);

  // Queries
  const { data: statsData, isLoading: isStatsLoading } = useExtracurricularStats();
  const { data: ekskulData, isLoading: isEkskulLoading } = useExtracurriculars();
  const { data: membersData, isLoading: isMembersLoading } = useExtracurricularMembers();

  // Mutations
  const createMutation = useCreateExtracurricular();
  const updateMutation = useUpdateExtracurricular();
  const deleteMutation = useDeleteExtracurricular();
  const registerMemberMutation = useRegisterExtracurricularMember();
  const deleteMemberMutation = useDeleteExtracurricularMember();
  const batchGradesMutation = useBatchUpsertExtracurricularGrades();

  const extracurricularList = ekskulData?.data ?? [];
  const memberList = membersData?.data ?? [];

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ExtracurricularItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, data },
        {
          onSuccess: () => setIsModalOpen(false),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  const handleDeleteEkskul = (id: string) => {
    if (window.confirm("Yakin ingin menghapus ekstrakurikuler ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm("Yakin ingin menghapus santri dari keanggotaan ekskul ini?")) {
      deleteMemberMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Ekstrakurikuler & Pengembangan Diri
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pengelolaan kegiatan minat bakat santri madrasah, presensi, dan penilaian formatif rapor RDM Kemenag.
        </p>
      </div>

      {/* Stats Cards */}
      <ExtracurricularStatsCards
        stats={statsData?.data}
        isLoading={isStatsLoading}
      />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("master")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === "master"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="w-4 h-4" />
          Master Kegiatan ({extracurricularList.length})
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === "members"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          Anggota & Pendaftaran ({memberList.length})
        </button>

        <button
          onClick={() => setActiveTab("grades")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === "grades"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          Penilaian Rapor RDM
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "master" && (
        <ExtracurricularTable
          items={extracurricularList}
          isLoading={isEkskulLoading}
          onAdd={handleOpenAdd}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteEkskul}
        />
      )}

      {activeTab === "members" && (
        <ExtracurricularMembersTab
          members={memberList}
          extracurriculars={extracurricularList}
          isLoading={isMembersLoading}
          onRegister={(data) => registerMemberMutation.mutate(data)}
          onDeleteMember={handleDeleteMember}
          isRegistering={registerMemberMutation.isPending}
        />
      )}

      {activeTab === "grades" && (
        <ExtracurricularGradesTab
          members={memberList}
          extracurriculars={extracurricularList}
          onBatchSave={(data) => batchGradesMutation.mutate(data)}
          isSaving={batchGradesMutation.isPending}
          isLoading={isMembersLoading}
        />
      )}

      {/* Form Modal */}
      <ExtracurricularFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        editingItem={editingItem}
      />
    </div>
  );
};
