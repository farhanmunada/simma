import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { useCreateOutgoingLetter, useClassifications } from "../api/letters.api";
import { useTeachers } from "../../settings/api/settings.api";
import type { LetterSecurityDegree, CreateOutgoingLetterInput } from "../types";

export interface CreateOutgoingLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateOutgoingLetterModal: React.FC<CreateOutgoingLetterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: classifications } = useClassifications();
  const { data: teachers = [] } = useTeachers();
  const createMutation = useCreateOutgoingLetter();

  const [form, setForm] = useState<CreateOutgoingLetterInput>({
    securityDegree: "B",
    satkerCode: "Ma.13.04",
    classificationCode: "PP.00.6",
    letterDate: new Date().toISOString().split("T")[0],
    recipient: "",
    subject: "",
    signerName: "",
    signerNip: "",
    signerRole: "Kepala Madrasah",
    templateType: "custom",
    status: "signed",
  });

  const handleSelectSigner = (teacherId: string) => {
    const selected = teachers.find((t) => t.id === teacherId);
    if (selected) {
      // Dapatkan NIP dari emisData atau NUPTK atau fallback "-"
      const nip =
        (selected.emisData?.nip as string) ||
        selected.nuptk ||
        (selected.employmentType === "PNS" ? selected.nik : "-");

      setForm((prev) => ({
        ...prev,
        signerName: selected.fullName,
        signerNip: nip,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        signerName: "",
        signerNip: "",
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form, {
      onSuccess: () => {
        onClose();
        setForm({
          securityDegree: "B",
          satkerCode: "Ma.13.04",
          classificationCode: "PP.00.6",
          letterDate: new Date().toISOString().split("T")[0],
          recipient: "",
          subject: "",
          signerName: "H. Ahmad Syarif, M.Pd.I",
          signerNip: "197508152003121002",
          signerRole: "Kepala Madrasah",
          templateType: "custom",
          status: "signed",
        });
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrasi Surat Keluar (PMA 12/2024)"
      description="Nomor sekuensial format resmi Kemenag RI digenerate otomatis aman konkurensi."
    >
      <form onSubmit={handleSubmit} className="space-y-3 mt-3 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Derajat Pengamanan</label>
            <select
              value={form.securityDegree}
              onChange={(e) =>
                setForm({ ...form, securityDegree: e.target.value as LetterSecurityDegree })
              }
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            >
              <option value="B">B - Biasa</option>
              <option value="R">R - Rahasia</option>
              <option value="SR">SR - Sangat Rahasia</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Kode Satker Madrasah</label>
            <input
              type="text"
              value={form.satkerCode || "Ma.13.04"}
              onChange={(e) => setForm({ ...form, satkerCode: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
              placeholder="Ma.13.04"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Kode Klasifikasi</label>
            <select
              value={form.classificationCode}
              onChange={(e) => setForm({ ...form, classificationCode: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            >
              {(classifications || []).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Tanggal Surat</label>
            <input
              type="date"
              required
              value={form.letterDate}
              onChange={(e) => setForm({ ...form, letterDate: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Tujuan / Penerima Surat</label>
          <input
            type="text"
            required
            value={form.recipient}
            onChange={(e) => setForm({ ...form, recipient: e.target.value })}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            placeholder="Kepala Kantor Kementerian Agama Kab/Kota"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Perihal Surat</label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            placeholder="Laporan Kesiapan Asesmen Madrasah Tahun Ajaran 2026/2027"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Pilih Penandatangan (GTK/Guru)
            </label>
            <select
              value={teachers.find((t) => t.fullName === form.signerName)?.id || ""}
              onChange={(e) => handleSelectSigner(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="">-- Pilih Guru / Staff GTK --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.employmentType})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Jabatan Penandatangan</label>
            <input
              type="text"
              required
              value={form.signerRole}
              onChange={(e) => setForm({ ...form, signerRole: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
              placeholder="Kepala Madrasah / Plt. / Waka"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Nama Penandatangan</label>
            <input
              type="text"
              required
              value={form.signerName}
              onChange={(e) => setForm({ ...form, signerName: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-slate-50"
              placeholder="Pilih dari dropdown di atas"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">NIP Penandatangan (Otomatis)</label>
            <input
              type="text"
              value={form.signerNip || ""}
              onChange={(e) => setForm({ ...form, signerNip: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-slate-50"
              placeholder="Terisi otomatis setelah nama dipilih"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
          >
            {createMutation.isPending ? "Menerbitkan..." : "Terbitkan Nomor Surat"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
