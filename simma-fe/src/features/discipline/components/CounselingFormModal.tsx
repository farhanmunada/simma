import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { Lock } from "lucide-react";
import type { CounselingSessionItem } from "../types";
import type { CreateCounselingSessionInput } from "@simma/shared";

interface CounselingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCounselingSessionInput) => Promise<void>;
  initialData?: CounselingSessionItem | null;
  studentsList: { id: string; fullName: string; className?: string | null }[];
  isLoading?: boolean;
}

const SESSION_TYPE_OPTIONS = [
  { value: "individual", label: "Konseling Individu (Privat)" },
  { value: "kelompok", label: "Konseling Kelompok" },
  { value: "orang_tua", label: "Konseling / Temu Orang Tua" },
  { value: "krisis", label: "Intervensi Krisis / Mendesak" },
];

const ISSUE_CATEGORY_OPTIONS = [
  { value: "kedisiplinan", label: "Pelanggaran Tata Tertib & Kedisiplinan" },
  { value: "akademik", label: "Kesulitan Belajar & Akademik" },
  { value: "sosial_emosional", label: "Relasi Sosial, Emosional & Bullying" },
  { value: "keluarga", label: "Kondisi Rumah & Masalah Keluarga" },
  { value: "karir_minat", label: "Pilihan Minat, Bakat & Studi Lanjut" },
];

const STATUS_OPTIONS = [
  { value: "dijadwalkan", label: "Dijadwalkan" },
  { value: "berlangsung", label: "Sedang Berlangsung" },
  { value: "selesai", label: "Selesai (Ditutup)" },
  { value: "tindak_lanjut", label: "Perlu Tindak Lanjut" },
  { value: "batal", label: "Dibatalkan" },
];

export function CounselingFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  studentsList,
  isLoading,
}: CounselingFormModalProps) {
  const [formData, setFormData] = useState<CreateCounselingSessionInput>({
    studentId: "",
    sessionDate: new Date().toISOString().slice(0, 16),
    sessionType: "individual",
    issueCategory: "kedisiplinan",
    problemDescription: "",
    counselingNotes: "",
    actionPlan: "",
    status: "dijadwalkan",
    followUpDate: "",
    isConfidential: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        studentId: initialData.studentId,
        sessionDate: initialData.sessionDate,
        sessionType: initialData.sessionType,
        issueCategory: initialData.issueCategory,
        problemDescription: initialData.problemDescription,
        counselingNotes: initialData.counselingNotes ?? "",
        actionPlan: initialData.actionPlan ?? "",
        status: initialData.status,
        followUpDate: initialData.followUpDate ?? "",
        isConfidential: initialData.isConfidential ?? true,
      });
    } else {
      setFormData({
        studentId: "",
        sessionDate: new Date().toISOString().slice(0, 16),
        sessionType: "individual",
        issueCategory: "kedisiplinan",
        problemDescription: "",
        counselingNotes: "",
        actionPlan: "",
        status: "dijadwalkan",
        followUpDate: "",
        isConfidential: true,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  const studentOptions = [
    { value: "", label: "-- Pilih Santri / Klien --" },
    ...studentsList.map((st) => ({
      value: st.id,
      label: `${st.fullName}${st.className ? ` (${st.className})` : ""}`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Ubah Sesi Konseling BK" : "Jadwalkan / Rekam Sesi Konseling BK"}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Kerahasiaan Medis & Konseling Dilindungi Kode Etik BK</span>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isConfidential ?? true}
              onChange={(e) => setFormData({ ...formData, isConfidential: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Privat (Hanya Guru BK)</span>
          </label>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Pilih Santri / Klien</label>
          <Select
            options={studentOptions}
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Tanggal & Waktu Sesi</label>
            <Input
              type="datetime-local"
              required
              value={formData.sessionDate}
              onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Bentuk Layanan</label>
            <Select
              options={SESSION_TYPE_OPTIONS}
              value={formData.sessionType}
              onChange={(e) => setFormData({ ...formData, sessionType: e.target.value as any })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Kategori Masalah</label>
            <Select
              options={ISSUE_CATEGORY_OPTIONS}
              value={formData.issueCategory}
              onChange={(e) => setFormData({ ...formData, issueCategory: e.target.value as any })}
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Status Penanganan</label>
            <Select
              options={STATUS_OPTIONS}
              value={formData.status ?? "dijadwalkan"}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Deskripsi Pokok Masalah</label>
          <textarea
            required
            rows={2}
            className="w-full rounded-md border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-emerald-500"
            placeholder="Jelaskan latar belakang dan keluhan santri..."
            value={formData.problemDescription}
            onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Catatan Dinamika & Refleksi BK</label>
          <textarea
            rows={2}
            className="w-full rounded-md border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-emerald-500"
            placeholder="Observasi perilaku, respon emosional santri saat bimbingan..."
            value={formData.counselingNotes ?? ""}
            onChange={(e) => setFormData({ ...formData, counselingNotes: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Rencana Tindak Lanjut (Action Plan)</label>
            <Input
              placeholder="Contoh: Pemantauan harian oleh wali asrama"
              value={formData.actionPlan ?? ""}
              onChange={(e) => setFormData({ ...formData, actionPlan: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Target Tanggal Evaluasi</label>
            <Input
              type="date"
              value={formData.followUpDate ?? ""}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Sesi BK"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
