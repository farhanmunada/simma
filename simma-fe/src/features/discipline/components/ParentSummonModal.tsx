import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { Mail } from "lucide-react";
import type { CreateParentSummonInput } from "@simma/shared";

interface ParentSummonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateParentSummonInput) => Promise<void>;
  studentsList: { id: string; fullName: string; className?: string | null; parentName?: string }[];
  isLoading?: boolean;
}

const SANCTION_LEVEL_OPTIONS = [
  { value: "teguran_lisan", label: "Teguran Lisan / Pembinaan Ringan" },
  { value: "sp_1", label: "Surat Peringatan 1 (SP-1)" },
  { value: "sp_2", label: "Surat Peringatan 2 (SP-2)" },
  { value: "sp_3", label: "Surat Peringatan 3 (SP-3 / Terakhir)" },
];

export function ParentSummonModal({
  isOpen,
  onClose,
  onSubmit,
  studentsList,
  isLoading,
}: ParentSummonModalProps) {
  const [formData, setFormData] = useState<CreateParentSummonInput>({
    studentId: "",
    parentName: "",
    summonDate: new Date().toISOString().split("T")[0],
    summonTime: "09:00 WIB",
    location: "Ruang BK / BP Madrasah",
    reason: "Konsultasi dan tindak lanjut kedisiplinan santri",
    sanctionLevel: "sp_1",
    notes: "",
  });

  const handleStudentSelect = (studentId: string) => {
    const student = studentsList.find((s) => s.id === studentId);
    setFormData((prev) => ({
      ...prev,
      studentId,
      parentName: student?.parentName ?? prev.parentName,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  const studentOptions = [
    { value: "", label: "-- Pilih Santri --" },
    ...studentsList.map((st) => ({
      value: st.id,
      label: `${st.fullName}${st.className ? ` (${st.className})` : ""}`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Terbitkan Surat Pemanggilan Orang Tua / Wali"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div className="bg-sky-50 border border-sky-200 text-sky-800 p-2.5 rounded-lg flex items-start gap-2">
          <Mail className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            Surat pemanggilan resmi akan diterbitkan dengan format kop standar Kemenag, nomor surat otomatis, dan dapat langsung diunduh dalam format PDF.
          </p>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Pilih Santri</label>
          <Select
            options={studentOptions}
            value={formData.studentId}
            onChange={(e) => handleStudentSelect(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Nama Orang Tua / Wali Murid</label>
          <Input
            required
            placeholder="Nama lengkap bapak/ibu wali santri"
            value={formData.parentName}
            onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Tanggal Kehadiran</label>
            <Input
              type="date"
              required
              value={formData.summonDate}
              onChange={(e) => setFormData({ ...formData, summonDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Waktu / Pukul</label>
            <Input
              required
              placeholder="Contoh: 09:00 WIB"
              value={formData.summonTime}
              onChange={(e) => setFormData({ ...formData, summonTime: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Tingkat Peringatan (Sanksi)</label>
            <Select
              options={SANCTION_LEVEL_OPTIONS}
              value={formData.sanctionLevel}
              onChange={(e) => setFormData({ ...formData, sanctionLevel: e.target.value as any })}
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Ruangan / Tempat</label>
            <Input
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Perihal / Alasan Pemanggilan</label>
          <textarea
            required
            rows={2}
            className="w-full rounded-md border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-emerald-500"
            placeholder="Jelaskan alasan pokok pemanggilan..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Catatan Tambahan (Opsional)</label>
          <Input
            placeholder="Contoh: Harap membawa kartu santri"
            value={formData.notes ?? ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menerbitkan..." : "Terbitkan Surat"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
