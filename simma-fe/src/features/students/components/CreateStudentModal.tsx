import React, { useState } from "react";
import type { StudentStatus, Gender, CreateStudentDto } from "../types";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";

export interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateStudentDto) => Promise<void>;
  isLoading: boolean;
}

export const CreateStudentModal: React.FC<CreateStudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [nik, setNik] = useState("");
  const [nisn, setNisn] = useState("");
  const [nis, setNis] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender>("L");
  const [motherName, setMotherName] = useState("");
  const [status, setStatus] = useState<StudentStatus>("aktif");
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setNik("");
    setNisn("");
    setNis("");
    setFullName("");
    setBirthPlace("");
    setBirthDate("");
    setGender("L");
    setMotherName("");
    setStatus("aktif");
    setFormError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): string | null => {
    if (!nik.trim()) return "NIK wajib diisi.";
    if (nik.trim().length !== 16 || !/^\d{16}$/.test(nik.trim())) {
      return "NIK harus tepat 16 digit angka.";
    }
    if (!fullName.trim()) return "Nama lengkap siswa wajib diisi.";
    if (!birthPlace.trim()) return "Tempat lahir wajib diisi.";
    if (!birthDate.trim()) return "Tanggal lahir wajib diisi.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate.trim())) {
      return "Format tanggal lahir harus YYYY-MM-DD.";
    }
    if (!motherName.trim()) return "Nama ibu kandung wajib diisi.";
    if (nisn.trim() && (nisn.trim().length !== 10 || !/^\d{10}$/.test(nisn.trim()))) {
      return "NISN harus tepat 10 digit angka jika diisi.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationMsg = validateForm();
    if (validationMsg) {
      setFormError(validationMsg);
      return;
    }

    const payload: CreateStudentDto = {
      nik: nik.trim(),
      nisn: nisn.trim() || null,
      nis: nis.trim() || null,
      fullName: fullName.trim(),
      birthPlace: birthPlace.trim(),
      birthDate: birthDate.trim(),
      gender,
      motherName: motherName.trim(),
      status,
    };

    try {
      await onSubmit(payload);
      resetForm();
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal mendaftarkan siswa baru.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tambah Siswa Baru"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {formError && (
          <div className="p-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="NIK (16 Digit)*"
            value={nik}
            onChange={(e) => setNik(e.target.value)}
            maxLength={16}
            placeholder="3201xxxxxxxxxxxx"
            required
          />
          <Input
            label="NISN (10 Digit)"
            value={nisn}
            onChange={(e) => setNisn(e.target.value)}
            maxLength={10}
            placeholder="00xxxxxxxx"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nama Lengkap Siswa*"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Contoh: Ahmad Fauzi"
            required
          />
          <Input
            label="NIS Lokal"
            value={nis}
            onChange={(e) => setNis(e.target.value)}
            placeholder="Contoh: 2026001"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Tempat Lahir*"
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
            placeholder="Contoh: Bandung"
            required
          />
          <Input
            label="Tanggal Lahir*"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Jenis Kelamin*"
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            options={[
              { value: "L", label: "Laki-laki" },
              { value: "P", label: "Perempuan" },
            ]}
            required
          />
          <Select
            label="Status Awal*"
            value={status}
            onChange={(e) => setStatus(e.target.value as StudentStatus)}
            options={[
              { value: "aktif", label: "Aktif" },
              { value: "aktif_tanpa_rombel", label: "Aktif Non-Rombel" },
              { value: "tidak_aktif", label: "Tidak Aktif" },
            ]}
            required
          />
        </div>

        <div>
          <Input
            label="Nama Ibu Kandung*"
            value={motherName}
            onChange={(e) => setMotherName(e.target.value)}
            placeholder="Nama lengkap ibu kandung"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
          >
            Batal
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isLoading}
          >
            Simpan Siswa
          </Button>
        </div>
      </form>
    </Modal>
  );
};
