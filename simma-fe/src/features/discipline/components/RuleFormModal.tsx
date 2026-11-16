import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import type { DisciplineRuleItem } from "../types";
import type { CreateDisciplineRuleInput } from "@simma/shared";

interface RuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDisciplineRuleInput) => Promise<void>;
  initialData?: DisciplineRuleItem | null;
  isLoading?: boolean;
}

const TYPE_OPTIONS = [
  { value: "infraction", label: "Pelanggaran (Poin Tambah)" },
  { value: "reward", label: "Apresiasi / Prestasi (Poin Kurang)" },
];

const INFRACTION_CATEGORY_OPTIONS = [
  { value: "ringan", label: "Ringan (Teguran / Pembinaan)" },
  { value: "sedang", label: "Sedang (Panggilan Ortu / SP)" },
  { value: "berat", label: "Berat (Skorsing / Konferensi Kasus)" },
];

const REWARD_CATEGORY_OPTIONS = [
  { value: "tahfidz", label: "Tahfidz & Keagamaan" },
  { value: "akademik", label: "Prestasi Akademik / OSN" },
  { value: "non_akademik", label: "Prestasi Non-Akademik / Olahraga / Seni" },
  { value: "kedisiplinan", label: "Keteladanan Kedisiplinan" },
];

const SANCTION_OPTIONS = [
  { value: "normal", label: "Normal (Tanpa Sanksi Tertulis)" },
  { value: "teguran_lisan", label: "Teguran Lisan" },
  { value: "sp_1", label: "Surat Peringatan 1 (SP-1)" },
  { value: "sp_2", label: "Surat Peringatan 2 (SP-2)" },
  { value: "sp_3", label: "Surat Peringatan 3 (SP-3)" },
];

export function RuleFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: RuleFormModalProps) {
  const [formData, setFormData] = useState<CreateDisciplineRuleInput>({
    code: "",
    name: "",
    description: "",
    type: "infraction",
    category: "ringan",
    points: 5,
    sanction: "normal",
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code,
        name: initialData.name,
        description: initialData.description ?? "",
        type: initialData.type,
        category: initialData.category,
        points: initialData.points,
        sanction: initialData.defaultSanction ?? "normal",
        isActive: initialData.isActive,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        description: "",
        type: "infraction",
        category: "ringan",
        points: 5,
        sanction: "normal",
        isActive: true,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  const categoryOptions =
    formData.type === "infraction" ? INFRACTION_CATEGORY_OPTIONS : REWARD_CATEGORY_OPTIONS;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Ubah Aturan Tata Tertib" : "Tambah Aturan Tata Tertib Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Kode Aturan</label>
            <Input
              required
              placeholder="Contoh: PLG-01 atau APR-01"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Jenis Aturan</label>
            <Select
              options={TYPE_OPTIONS}
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as any,
                  category: e.target.value === "reward" ? "tahfidz" : "ringan",
                })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Nama / Uraian Aturan</label>
          <Input
            required
            placeholder="Contoh: Terlambat Masuk Madrasah > 15 Menit"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Kategori</label>
            <Select
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Bobot Poin</label>
            <Input
              type="number"
              min={1}
              max={150}
              required
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Tingkat Sanksi Default</label>
          <Select
            options={SANCTION_OPTIONS}
            value={formData.sanction ?? "normal"}
            onChange={(e) => setFormData({ ...formData, sanction: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Keterangan / Regulasi</label>
          <textarea
            rows={3}
            className="w-full rounded-md border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-emerald-500"
            placeholder="Rujukan pasal atau panduan penanganan..."
            value={formData.description ?? ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Aturan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
