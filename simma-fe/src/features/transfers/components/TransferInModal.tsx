import React, { useState } from "react";
import { ArrowDownLeft } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { useCreateTransferIn } from "../api/transfers.api";

interface ClassroomOption {
  id: string;
  name: string;
}

interface AcademicYearOption {
  id: string;
  name: string;
}

interface TransferInModalProps {
  isOpen: boolean;
  onClose: () => void;
  classrooms: ClassroomOption[];
  academicYears: AcademicYearOption[];
  currentAcademicYearId?: string;
}

export const TransferInModal: React.FC<TransferInModalProps> = ({
  isOpen,
  onClose,
  classrooms,
  academicYears,
  currentAcademicYearId,
}) => {
  const createMutation = useCreateTransferIn();
  const [formData, setFormData] = useState({
    studentName: "",
    studentNisn: "",
    gender: "L" as "L" | "P",
    birthPlace: "",
    birthDate: "2008-01-01",
    originSchool: "",
    originLetterNumber: "",
    previousClassLevel: 10,
    targetClassroomId: classrooms[0]?.id ?? "",
    transferDate: new Date().toISOString().split("T")[0],
    reason: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        student: {
          fullName: formData.studentName,
          nisn: formData.studentNisn || null,
          gender: formData.gender,
          birthPlace: formData.birthPlace || null,
          birthDate: formData.birthDate,
        },
        originSchool: formData.originSchool,
        originLetterNumber: formData.originLetterNumber || "SURAT-01",
        previousClassLevel: formData.previousClassLevel,
        targetClassroomId: formData.targetClassroomId,
        transferDate: formData.transferDate,
        notes: formData.notes || null,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pencatatan Mutasi Masuk Siswa" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
          <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          <span>Mencatat penerimaan siswa pindahan dari madrasah/sekolah luar ke kelas target.</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-medium text-slate-700 mb-1">Nama Lengkap Siswa *</label>
            <input
              type="text"
              required
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              placeholder="Contoh: Ahmad Zaki"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">NISN (10 digit) *</label>
            <input
              type="text"
              required
              maxLength={10}
              value={formData.studentNisn}
              onChange={(e) => setFormData({ ...formData, studentNisn: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
              placeholder="0012345678"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">No. Surat Rekomendasi Asal *</label>
            <input
              type="text"
              required
              value={formData.originLetterNumber}
              onChange={(e) => setFormData({ ...formData, originLetterNumber: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              placeholder="Contoh: 120/MA/IV/2026"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Jenis Kelamin *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as "L" | "P" })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Sekolah Asal *</label>
            <input
              type="text"
              required
              value={formData.originSchool}
              onChange={(e) => setFormData({ ...formData, originSchool: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              placeholder="Contoh: MTsN 1 Yogyakarta"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Kelas Target Penempatan *</label>
            <select
              required
              value={formData.targetClassroomId}
              onChange={(e) => setFormData({ ...formData, targetClassroomId: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="">-- Pilih Kelas --</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Tanggal Mutasi Masuk *</label>
            <input
              type="date"
              required
              value={formData.transferDate}
              onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-slate-700 mb-1">Alasan Pindah</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              placeholder="Contoh: Mengikuti perpindahan tugas dinas orang tua"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={createMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {createMutation.isPending ? "Menyimpan..." : "Simpan Mutasi Masuk"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
