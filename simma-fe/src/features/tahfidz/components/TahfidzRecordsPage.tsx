import React, { useState } from "react";
import { Plus, Filter } from "lucide-react";
import {
  useTahfidzRecords,
  useCreateTahfidzRecord,
  useUpdateTahfidzRecord,
  useDeleteTahfidzRecord,
} from "../api/tahfidz.api";
import type {
  TahfidzRecord,
  TahfidzType,
  TahfidzStatus,
  TahfidzQueryParams,
  CreateTahfidzRecordDto,
  UpdateTahfidzRecordDto,
} from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { TahfidzLogTable } from "./TahfidzLogTable";
import { TahfidzEntryForm } from "./TahfidzEntryForm";

export const TahfidzRecordsPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>("");
  const [filterJuz, setFilterJuz] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  const queryParams: TahfidzQueryParams = {
    type: filterType ? (filterType as TahfidzType) : undefined,
    juz: filterJuz ? parseInt(filterJuz, 10) : undefined,
    status: filterStatus ? (filterStatus as TahfidzStatus) : undefined,
    startDate: filterStartDate || undefined,
    endDate: filterEndDate || undefined,
  };

  const { data: recordsData, isLoading, isError, error } = useTahfidzRecords(queryParams);
  const records = recordsData?.data || [];

  const createMutation = useCreateTahfidzRecord();
  const updateMutation = useUpdateTahfidzRecord();
  const deleteMutation = useDeleteTahfidzRecord();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TahfidzRecord | null>(null);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: TahfidzRecord) => {
    setEditingRecord(rec);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleSubmit = async (
    data: CreateTahfidzRecordDto | (UpdateTahfidzRecordDto & { id: string })
  ) => {
    if ("id" in data && data.id) {
      const { id, ...dto } = data;
      await updateMutation.mutateAsync({ id, data: dto });
    } else {
      await createMutation.mutateAsync(data as CreateTahfidzRecordDto);
    }
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data setoran ini?")) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr?.message || "Gagal menghapus catatan setoran.");
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
          <h1 className="text-lg font-bold text-slate-800">Setoran Hafalan Al-Qur'an</h1>
          <p className="text-xs text-slate-500">
            Pencatatan harian Ziyadah (tambah hafalan) & Muraja'ah (pengulangan)
          </p>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Tambah Setoran</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-600">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Setoran</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          <Select
            label="Tipe Setoran"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: "", label: "Semua Tipe" },
              { value: "Z", label: "Ziyadah (Baru)" },
              { value: "M", label: "Muraja'ah (Ulang)" },
            ]}
          />
          <Select
            label="Juz"
            value={filterJuz}
            onChange={(e) => setFilterJuz(e.target.value)}
            options={[{ value: "", label: "Semua Juz" }, ...juzOptions]}
          />
          <Select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: "", label: "Semua Status" },
              { value: "lulus", label: "Lulus" },
              { value: "perlu_perbaikan", label: "Perlu Perbaikan" },
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

      {/* Records Table */}
      <TahfidzLogTable
        records={records}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        deletingId={deleteMutation.isPending ? deleteMutation.variables : null}
      />

      {/* Modal Form */}
      <TahfidzEntryForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingRecord={editingRecord}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
