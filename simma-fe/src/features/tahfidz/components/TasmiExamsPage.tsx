import React, { useState } from "react";
import { Plus, Filter } from "lucide-react";
import {
  useTasmiExams,
  useCreateTasmiExam,
  useUpdateTasmiExam,
  useDeleteTasmiExam,
} from "../api/tahfidz.api";
import type {
  TasmiExam,
  TasmiStatus,
  TasmiQueryParams,
  CreateTasmiExamDto,
  UpdateTasmiExamDto,
} from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { TasmiExamTable } from "./TasmiExamTable";
import { TasmiExamForm } from "./TasmiExamForm";

export const TasmiExamsPage: React.FC = () => {
  // Filters
  const [filterJuz, setFilterJuz] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  const queryParams: TasmiQueryParams = {
    juz: filterJuz ? parseInt(filterJuz, 10) : undefined,
    status: filterStatus ? (filterStatus as TasmiStatus) : undefined,
    startDate: filterStartDate || undefined,
    endDate: filterEndDate || undefined,
  };

  const { data: examsData, isLoading, isError, error } = useTasmiExams(queryParams);
  const exams = examsData?.data || [];

  const createMutation = useCreateTasmiExam();
  const updateMutation = useUpdateTasmiExam();
  const deleteMutation = useDeleteTasmiExam();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<TasmiExam | null>(null);

  const handleOpenAdd = () => {
    setEditingExam(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: TasmiExam) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExam(null);
  };

  const handleSubmit = async (
    data: CreateTasmiExamDto | (UpdateTasmiExamDto & { id: string })
  ) => {
    if ("id" in data && data.id) {
      const { id, ...dto } = data;
      await updateMutation.mutateAsync({ id, data: dto });
    } else {
      await createMutation.mutateAsync(data as CreateTasmiExamDto);
    }
    setIsModalOpen(false);
    setEditingExam(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ujian Tasmi' ini?")) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr?.message || "Gagal menghapus data ujian Tasmi'.");
    }
  };

  const juzOptions = Array.from({ length: 30 }, (_, i) => ({
    value: i + 1,
    label: `Juz ${i + 1}`,
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Ujian Tasmi' Al-Qur'an</h1>
          <p className="text-xs text-slate-500">
            Penilaian ujian sekali duduk per juz oleh dewan asatidz / penguji
          </p>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Tambah Ujian Tasmi'</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-600">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Ujian</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          <Select
            label="Juz"
            value={filterJuz}
            onChange={(e) => setFilterJuz(e.target.value)}
            options={[{ value: "", label: "Semua Juz" }, ...juzOptions]}
          />
          <Select
            label="Status Kelulusan"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: "", label: "Semua Status" },
              { value: "lulus", label: "Lulus" },
              { value: "perlu_perbaikan", label: "Perlu Perbaikan" },
              { value: "tidak_lulus", label: "Tidak Lulus" },
            ]}
          />
          <Input
            type="date"
            label="Mulai Tanggal"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
          <Input
            type="date"
            label="Sampai Tanggal"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
          />
        </div>
      </Card>

      {/* Table Data */}
      <TasmiExamTable
        exams={exams}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        deletingId={deleteMutation.isPending ? deleteMutation.variables : null}
      />

      {/* Input / Edit Modal */}
      <TasmiExamForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingExam={editingExam}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
