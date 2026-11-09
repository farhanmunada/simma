import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { useCreateDisposition, useIncomingLetters } from "../api/letters.api";
import type { LetterUrgency, DispositionInstruction } from "../types";

export interface CreateDispositionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateDispositionModal: React.FC<CreateDispositionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: incomingData } = useIncomingLetters();
  const createMutation = useCreateDisposition();

  const [createForm, setCreateForm] = useState<{
    incomingLetterId: string;
    disposedBy: string;
    targetRole: string;
    targetUserId: string;
    urgency: LetterUrgency;
    instruction: DispositionInstruction;
    notes: string;
    deadline: string;
  }>({
    incomingLetterId: "",
    disposedBy: "Kepala Madrasah",
    targetRole: "Wakamad Kurikulum",
    targetUserId: "018f3a2c-1234-7000-8000-000000000002",
    urgency: "segera",
    instruction: "tindak_lanjuti",
    notes: "",
    deadline: "",
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        ...createForm,
        targetUserId: createForm.targetUserId || undefined,
        deadline: createForm.deadline || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          setCreateForm({
            incomingLetterId: "",
            disposedBy: "Kepala Madrasah",
            targetRole: "Wakamad Kurikulum",
            targetUserId: "018f3a2c-1234-7000-8000-000000000002",
            urgency: "segera",
            instruction: "tindak_lanjuti",
            notes: "",
            deadline: "",
          });
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Beri Disposisi Kamad (PMA 12/2024)"
    >
      <form onSubmit={handleCreateSubmit} className="space-y-3 mt-3 text-xs">
        <div>
          <label className="block text-slate-700 font-medium mb-1">Pilih Surat Masuk</label>
          <select
            required
            value={createForm.incomingLetterId}
            onChange={(e) =>
              setCreateForm({ ...createForm, incomingLetterId: e.target.value })
            }
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
          >
            <option value="">-- Pilih Agenda Surat Masuk --</option>
            {(incomingData?.data || []).map((l) => (
              <option key={l.id} value={l.id}>
                [{l.agendaNumber}] {l.subject} ({l.senderName})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Sifat Disposisi</label>
            <select
              value={createForm.urgency}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  urgency: e.target.value as LetterUrgency,
                })
              }
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            >
              <option value="biasa">Biasa</option>
              <option value="segera">Segera</option>
              <option value="sangat_segera">Sangat Segera</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Instruksi</label>
            <select
              value={createForm.instruction}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  instruction: e.target.value as DispositionInstruction,
                })
              }
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            >
              <option value="tindak_lanjuti">Tindak Lanjuti</option>
              <option value="tanggapi">Tanggapi</option>
              <option value="hadiri">Hadiri / Wakili</option>
              <option value="koordinasikan">Koordinasikan</option>
              <option value="arsipkan">Arsipkan</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Batas Waktu (Tenggat)</label>
          <input
            type="date"
            value={createForm.deadline}
            onChange={(e) =>
              setCreateForm({ ...createForm, deadline: e.target.value })
            }
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Catatan Instruksi Kamad</label>
          <textarea
            rows={2}
            value={createForm.notes}
            onChange={(e) =>
              setCreateForm({ ...createForm, notes: e.target.value })
            }
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            placeholder="Instruksi spesifik untuk pelaksana disposisi..."
          />
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
            {createMutation.isPending ? "Mengirim..." : "Kirim Disposisi"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
