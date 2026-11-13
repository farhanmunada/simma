import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import type { ExtracurricularItem, CreateExtracurricularInput } from "../types";
import { EXTRACURRICULAR_CATEGORIES } from "@simma/shared";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExtracurricularInput) => void;
  isLoading: boolean;
  editingItem?: ExtracurricularItem | null;
}

export const ExtracurricularFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  editingItem,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateExtracurricularInput>({
    defaultValues: {
      code: "",
      name: "",
      category: "olahraga",
      scheduleDay: "Sabtu",
      scheduleTime: "14:00 - 16:00",
      venue: "",
      maxCapacity: 30,
      isActive: true,
    },
  });

  useEffect(() => {
    if (editingItem) {
      reset({
        code: editingItem.code,
        name: editingItem.name,
        category: editingItem.category,
        scheduleDay: editingItem.scheduleDay ?? "",
        scheduleTime: editingItem.scheduleTime ?? "",
        venue: editingItem.venue ?? "",
        maxCapacity: editingItem.maxCapacity ?? undefined,
        isActive: editingItem.isActive,
      });
    } else {
      reset({
        code: "",
        name: "",
        category: "olahraga",
        scheduleDay: "Sabtu",
        scheduleTime: "14:00 - 16:00",
        venue: "",
        maxCapacity: 30,
        isActive: true,
      });
    }
  }, [editingItem, reset, isOpen]);

  const handleFormSubmit = (data: CreateExtracurricularInput) => {
    onSubmit({
      ...data,
      maxCapacity: data.maxCapacity ? Number(data.maxCapacity) : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? "Edit Ekstrakurikuler" : "Tambah Ekstrakurikuler Baru"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Kode Ekskul"
            placeholder="Misal: PRAM, FUTS, ROBOT"
            error={errors.code?.message}
            {...register("code", { required: "Kode ekskul wajib diisi" })}
          />
          <Input
            label="Nama Ekstrakurikuler"
            placeholder="Misal: Gerakan Pramuka"
            error={errors.name?.message}
            {...register("name", { required: "Nama ekskul wajib diisi" })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Kategori"
            error={errors.category?.message}
            options={EXTRACURRICULAR_CATEGORIES.map((cat) => ({
              value: cat,
              label: cat.charAt(0).toUpperCase() + cat.slice(1),
            }))}
            {...register("category", { required: "Kategori wajib dipilih" })}
          />
          <Input
            label="Kapasitas Maksimal (Siswa)"
            type="number"
            placeholder="30"
            error={errors.maxCapacity?.message}
            {...register("maxCapacity", { valueAsNumber: true })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Hari Kegiatan"
            placeholder="Misal: Sabtu"
            {...register("scheduleDay")}
          />
          <Input
            label="Waktu Kegiatan"
            placeholder="Misal: 14:00 - 16:00"
            {...register("scheduleTime")}
          />
        </div>

        <Input
          label="Lokasi / Tempat"
          placeholder="Misal: Lapangan Utama / Gedung Serbaguna"
          {...register("venue")}
        />

        <div className="flex items-center gap-2 pt-2">
          <input
            id="isActive"
            type="checkbox"
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            {...register("isActive")}
          />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
            Ekstrakurikuler Aktif (Dapat dipilih siswa)
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {editingItem ? "Simpan Perubahan" : "Simpan Ekskul"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
