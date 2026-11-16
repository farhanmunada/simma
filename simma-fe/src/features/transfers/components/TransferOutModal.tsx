import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { useCreateTransferOut } from "../api/transfers.api";

interface StudentOption {
  id: string;
  name: string;
  nisn?: string | null;
  classroomName?: string | null;
}

interface TransferOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentOption[];
}

export const TransferOutModal: React.FC<TransferOutModalProps> = ({
  isOpen,
  onClose,
  students,
}) => {
  const createMutation = useCreateTransferOut();
  const [formData, setFormData] = useState({
    studentId: "",
    destinationSchool: "",
    transferDate: new Date().toISOString().split("T")[0],
    reason: "",
    notes: "",
  });

  const selectedStudent = students.find((s) => s.id === formData.studentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        studentId: formData.studentId,
        destinationSchool: formData.destinationSchool,
        transferDate: formData.transferDate,
        reason: formData.reason || "Pindah domisili mengikuti orang tua",
        notes: formData.notes || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pengajuan Mutasi Keluar Siswa" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-xs text-blue-800">
          <ArrowUpRight className="w-4 h-4 text-blue-600" />
          <span>Pengajuan mutasi keluar akan memulai alur checklist 3-dimensi (Clearance).</span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Pilih Siswa Aktif *</label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="">-- Pilih Siswa --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.classroomName ?? "Tanpa Kelas"} - NISN: {s.nisn ?? "-"})
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="p-2.5 bg-slate-50 border rounded text-xs space-y-1">
              <p><span className="text-slate-500">Nama:</span> <strong>{selectedStudent.name}</strong></p>
              <p><span className="text-slate-500">Kelas:</span> {selectedStudent.classroomName ?? "-"}</p>
              <p><span className="text-slate-500">NISN:</span> {selectedStudent.nisn ?? "-"}</p>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">Madrasah / Sekolah Tujuan *</label>
            <input
              type="text"
              required
              value={formData.destinationSchool}
              onChange={(e) => setFormData({ ...formData, destinationSchool: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="Contoh: SMAN 1 Yogyakarta / MA Ali Maksum"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Tanggal Rencana Pindah *</label>
            <input
              type="date"
              required
              value={formData.transferDate}
              onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Alasan Pindah Sekolah</label>
            <textarea
              rows={2}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="Contoh: Domisili orang tua berpindah ke luar kota"
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {createMutation.isPending ? "Mengajukan..." : "Ajukan Mutasi Keluar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
