import React, { useState } from "react";
import {
  useTeachersList,
  useTeacherStats,
  useCreateTeacher,
  useUpdateTeacher,
  useDeleteTeacher,
} from "../api/teachers.api";
import { TeacherStatsCards } from "../components/TeacherStatsCards";
import { TeacherFilterBar } from "../components/TeacherFilterBar";
import { TeacherTable } from "../components/TeacherTable";
import { TeacherFormModal } from "../components/TeacherFormModal";
import { TeacherDetailModal } from "../components/TeacherDetailModal";
import type { TeacherListItem } from "../types";
import type { EmploymentType, DutyStatus } from "@simma/shared";

export const TeacherListPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType | undefined>();
  const [dutyStatus, setDutyStatus] = useState<DutyStatus | undefined>();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherListItem | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: listData, isLoading: listLoading } = useTeachersList({
    search: search || undefined,
    employmentType,
    dutyStatus,
  });

  const { data: stats, isLoading: statsLoading } = useTeacherStats();
  const createMutation = useCreateTeacher();
  const updateMutation = useUpdateTeacher();
  const deleteMutation = useDeleteTeacher();

  const handleOpenAdd = () => {
    setSelectedTeacher(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (teacher: TeacherListItem) => {
    setSelectedTeacher(teacher);
    setFormOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data GTK "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    if (selectedTeacher) {
      await updateMutation.mutateAsync({ id: selectedTeacher.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleExportEmis = () => {
    const raw = listData?.data || [];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["NIK,NUPTK,Nama,Status,Jenis,JTM"].join(",") +
      "\n" +
      raw
        .map(
          (t) =>
            `"${t.nik}","${t.nuptk || ""}","${t.fullName}","${t.employmentType}","${
              t.profile?.gtkType || "pendidik"
            }","${t.currentWorkload?.totalJtm || 0}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SIMMA_GTK_EMIS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kepegawaian & GTK Madrasah</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pengelolaan direktori pendidik, tenaga kependidikan, riwayat kepangkatan, dan beban kerja.
        </p>
      </div>

      <TeacherStatsCards stats={stats} isLoading={statsLoading} />

      <TeacherFilterBar
        search={search}
        onSearchChange={setSearch}
        employmentType={employmentType}
        onEmploymentTypeChange={setEmploymentType}
        dutyStatus={dutyStatus}
        onDutyStatusChange={setDutyStatus}
        onAddClick={handleOpenAdd}
        onExportEmisClick={handleExportEmis}
      />

      <TeacherTable
        teachers={listData?.data || []}
        isLoading={listLoading}
        onViewDetail={setDetailId}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <TeacherFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedTeacher}
      />

      <TeacherDetailModal teacherId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
};
