import React, { useState } from "react";
import type { ParentRelationType, CreateAndLinkParentDto } from "../types";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";

export interface AddParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAndLinkParentDto) => Promise<void>;
  isLoading: boolean;
}

export const AddParentModal: React.FC<AddParentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [parentName, setParentName] = useState("");
  const [parentNik, setParentNik] = useState("");
  const [relationType, setRelationType] = useState<ParentRelationType>("ayah");
  const [isGuardian, setIsGuardian] = useState(false);
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [education, setEducation] = useState("");
  const [income, setIncome] = useState("");
  const [address, setAddress] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setParentName("");
    setParentNik("");
    setRelationType("ayah");
    setIsGuardian(false);
    setPhone("");
    setOccupation("");
    setEducation("");
    setIncome("");
    setAddress("");
    setFormError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!parentName.trim()) {
      setFormError("Nama orang tua/wali wajib diisi.");
      return;
    }

    if (parentNik.trim() && (parentNik.trim().length !== 16 || !/^\d{16}$/.test(parentNik.trim()))) {
      setFormError("NIK harus tepat 16 digit angka jika diisi.");
      return;
    }

    const payload: CreateAndLinkParentDto = {
      relationType,
      isGuardian,
      parent: {
        name: parentName.trim(),
        nik: parentNik.trim() || undefined,
        phone: phone.trim() || undefined,
        occupation: occupation.trim() || undefined,
        education: education.trim() || undefined,
        income: income.trim() || undefined,
        address: address.trim() || undefined,
      },
    };

    try {
      await onSubmit(payload);
      resetForm();
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal menambahkan data orang tua/wali.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tambah Data Orang Tua / Wali"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {formError && (
          <div className="p-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nama Lengkap Orang Tua/Wali*"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Contoh: Budi Santoso"
            required
          />
          <Input
            label="NIK (16 Digit)"
            value={parentNik}
            onChange={(e) => setParentNik(e.target.value)}
            maxLength={16}
            placeholder="3201xxxxxxxxxxxx"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Hubungan Keluarga*"
            value={relationType}
            onChange={(e) => setRelationType(e.target.value as ParentRelationType)}
            options={[
              { value: "ayah", label: "Ayah Kandung / Tiri" },
              { value: "ibu", label: "Ibu Kandung / Tiri" },
              { value: "wali", label: "Wali" },
            ]}
            required
          />
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isGuardianCheck"
              checked={isGuardian}
              onChange={(e) => setIsGuardian(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <label htmlFor="isGuardianCheck" className="text-xs text-slate-700 font-medium">
              Tetapkan sebagai Wali Utama
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nomor WhatsApp / HP"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
          />
          <Input
            label="Pekerjaan"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="Contoh: Pegawai Negeri / Wiraswasta"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Pendidikan Terakhir"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="Contoh: S1 / SMA"
          />
          <Input
            label="Penghasilan Bulanan"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Contoh: Rp 3.000.000 - Rp 5.000.000"
          />
        </div>

        <div>
          <Input
            label="Alamat Lengkap"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Alamat domisili orang tua/wali"
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
            Simpan Orang Tua
          </Button>
        </div>
      </form>
    </Modal>
  );
};
