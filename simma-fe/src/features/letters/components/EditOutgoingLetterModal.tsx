import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { useUpdateOutgoingLetter, useClassifications } from "../api/letters.api";
import { useTeachers } from "../../settings/api/settings.api";
import type { OutgoingLetter } from "../types";

export interface EditOutgoingLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: OutgoingLetter | null;
}

export const EditOutgoingLetterModal: React.FC<EditOutgoingLetterModalProps> = ({
  isOpen,
  onClose,
  letter,
}) => {
  const { data: classifications } = useClassifications();
  const { data: teachers = [] } = useTeachers();
  const updateMutation = useUpdateOutgoingLetter();

  const [form, setForm] = useState({
    recipient: "",
    subject: "",
    classificationCode: "",
    signerName: "",
    signerNip: "",
    signerRole: "Kepala Madrasah",
    body: "",
  });

  useEffect(() => {
    if (letter) {
      const content = letter.contentData as Record<string, string> | null;
      setForm({
        recipient: letter.recipient || letter.recipientName || "",
        subject: letter.subject || "",
        classificationCode: letter.classificationCode || "PP.00.6",
        signerName: letter.signerName || "",
        signerNip: letter.signerNip || "",
        signerRole: letter.signerRole || "Kepala Madrasah",
        body: content?.body || "",
      });
    }
  }, [letter]);

  const handleSelectSigner = (teacherId: string) => {
    const selected = teachers.find((t) => t.id === teacherId);
    if (selected) {
      const nip =
        (selected.emisData?.nip as string) ||
        selected.nuptk ||
        (selected.employmentType === "PNS" ? selected.nik : "-");

      setForm((prev) => ({
        ...prev,
        signerName: selected.fullName,
        signerNip: nip,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!letter) return;

    updateMutation.mutate(
      {
        id: letter.id,
        data: {
          recipient: form.recipient,
          subject: form.subject,
          classificationCode: form.classificationCode,
          signerName: form.signerName,
          signerNip: form.signerNip,
          signerRole: form.signerRole,
          contentData: {
            ...((letter.contentData as Record<string, unknown>) || {}),
            body: form.body,
          },
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Surat Keluar"
      description={`Ubah informasi naskah dinas: ${letter?.letterNumber || ""}`}
    >
      <form onSubmit={handleSubmit} className="space-y-3 mt-3 text-xs">
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
            <label className="block text-slate-700 font-medium mb-1">Tujuan / Penerima</label>
            <input
              type="text"
              required
              value={form.recipient}
              onChange={(e) => setForm({ ...form, recipient: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Perihal Surat</label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">
            Isi Narasi / Batang Tubuh Surat
          </label>
          <textarea
            rows={4}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-[11px]"
            placeholder="Tuliskan naskah surat lengkap..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Pilih Penandatangan (GTK)
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
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">NIP Penandatangan</label>
            <input
              type="text"
              value={form.signerNip}
              onChange={(e) => setForm({ ...form, signerNip: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
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
            disabled={updateMutation.isPending}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
          >
            {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
