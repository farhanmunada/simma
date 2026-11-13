import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { AlertCircle } from "lucide-react";
import type { DisciplineRuleItem } from "../types";
import type { CreateStudentInfractionInput } from "@simma/shared";

interface InfractionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStudentInfractionInput) => Promise<void>;
  rules: DisciplineRuleItem[];
  studentsList: { id: string; fullName: string; className?: string | null }[];
  isLoading?: boolean;
}

export function InfractionFormModal({
  isOpen,
  onClose,
  onSubmit,
  rules,
  studentsList,
  isLoading,
}: InfractionFormModalProps) {
  const [formData, setFormData] = useState<CreateStudentInfractionInput>({
    studentId: "",
    ruleId: "",
    date: new Date().toISOString().split("T")[0],
    type: "infraction",
    category: "ringan",
    points: 10,
    title: "",
    description: "",
    location: "",
    witness: "",
    notes: "",
  });

  const handleRuleChange = (ruleId: string) => {
    const selected = rules.find((r) => r.id === ruleId);
    if (selected) {
      setFormData({
        ...formData,
        ruleId: selected.id,
        type: selected.type,
        category: selected.category,
        points: selected.points,
        title: selected.name,
      });
    } else {
      setFormData({ ...formData, ruleId: "" });
    }
  };

  const isHeavyInfraction = formData.type === "infraction" && formData.points > 50;

  const studentOptions = [
    { value: "", label: "-- Pilih Siswa --" },
    ...studentsList.map((st) => ({
      value: st.id,
      label: `${st.fullName}${st.className ? ` (${st.className})` : ""}`,
    })),
  ];

  const ruleOptions = [
    { value: "", label: "-- Input Manual / Non-Katalog --" },
    ...rules.map((r) => ({
      value: r.id,
      label: `[${r.code}] ${r.name} (${r.points} poin)`,
    })),
  ];

  const typeOptions = [
    { value: "infraction", label: "Pelanggaran" },
    { value: "reward", label: "Apresiasi / Prestasi" },
  ];

  const infractionCategoryOptions = [
    { value: "ringan", label: "Ringan" },
    { value: "sedang", label: "Sedang" },
    { value: "berat", label: "Berat" },
  ];

  const rewardCategoryOptions = [
    { value: "tahfidz", label: "Tahfidz" },
    { value: "akademik", label: "Akademik" },
    { value: "non_akademik", label: "Non-Akademik" },
    { value: "kedisiplinan", label: "Kedisiplinan" },
  ];

  const categoryOptions =
    formData.type === "infraction" ? infractionCategoryOptions : rewardCategoryOptions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Kejadian Disiplin / Apresiasi Santri"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {isHeavyInfraction && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong>Otorisasi Dibutuhkan:</strong> Bobot pelanggaran melebihi 50 poin. Catatan ini akan berstatus <em>Pending Approval</em> dan otomatis diteruskan ke Waka Kesiswaan / Kepala Madrasah sebelum poin diakumulasikan.
            </p>
          </div>
        )}

        <div>
          <label className="block text-slate-700 font-medium mb-1">Pilih Santri / Siswa</label>
          <Select
            options={studentOptions}
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Pilih dari Master Tatib (Opsional)</label>
            <Select
              options={ruleOptions}
              value={formData.ruleId ?? ""}
              onChange={(e) => handleRuleChange(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Tanggal Kejadian</label>
            <Input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Judul / Bentuk Kejadian</label>
          <Input
            required
            placeholder="Contoh: Merokok di Belakang Kantin / Juara 1 OSN Matematika"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Tipe</label>
            <Select
              options={typeOptions}
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Lokasi Kejadian</label>
            <Input
              placeholder="Contoh: Musholla / Kelas X-A"
              value={formData.location ?? ""}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Saksi Mata (Bila Ada)</label>
            <Input
              placeholder="Contoh: Ustadz Hasan / Pengurus Kelas"
              value={formData.witness ?? ""}
              onChange={(e) => setFormData({ ...formData, witness: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Kronologi / Catatan Kejadian</label>
          <textarea
            rows={2}
            className="w-full rounded-md border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-emerald-500"
            placeholder="Jelaskan kronologi singkat penemuan atau capaian..."
            value={formData.description ?? ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Catatan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
