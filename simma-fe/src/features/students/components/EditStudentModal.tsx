import React, { useState, useEffect } from "react";
import type { Student, StudentStatus, UpdateStudentDto } from "../types";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";

export interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onSubmit: (payload: UpdateStudentDto) => Promise<void>;
  isLoading: boolean;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onSubmit,
  isLoading,
}) => {
  const [editStatus, setEditStatus] = useState<StudentStatus>(student.status);
  const [editNis, setEditNis] = useState(student.nis || "");
  const [editPhotoPath, setEditPhotoPath] = useState(student.photoPath || "");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setEditStatus(student.status);
      setEditNis(student.nis || "");
      setEditPhotoPath(student.photoPath || "");
      setFormError(null);
    }
  }, [student, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload: UpdateStudentDto = {
      status: editStatus,
      nis: editNis.trim() || null,
      photoPath: editPhotoPath.trim() || null,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal memperbarui data siswa.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ubah Data Siswa"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {formError && (
          <div className="p-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
            {formError}
          </div>
        )}

        <div>
          <Select
            label="Status Siswa*"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as StudentStatus)}
            options={[
              { value: "aktif", label: "Aktif" },
              { value: "aktif_tanpa_rombel", label: "Aktif Non-Rombel" },
              { value: "lulus", label: "Lulus" },
              { value: "mutasi_keluar", label: "Mutasi Keluar" },
              { value: "tidak_aktif", label: "Tidak Aktif" },
              { value: "do", label: "Drop Out" },
            ]}
            required
          />
        </div>

        <div>
          <Input
            label="NIS Lokal"
            value={editNis}
            onChange={(e) => setEditNis(e.target.value)}
            placeholder="Nomor Induk Siswa lokal"
          />
        </div>

        <div>
          <Input
            label="URL Foto Siswa"
            value={editPhotoPath}
            onChange={(e) => setEditPhotoPath(e.target.value)}
            placeholder="https://example.com/foto.jpg"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isLoading}
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
