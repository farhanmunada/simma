import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { useCreateExpedition } from "../api/letters.api";
import type { CreateExpeditionBookInput } from "../types";

export interface CreateExpeditionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateExpeditionModal: React.FC<CreateExpeditionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const createMutation = useCreateExpedition();

  const [form, setForm] = useState<CreateExpeditionBookInput>({
    outgoingLetterId: "",
    dispatchDate: new Date().toISOString().split("T")[0],
    courierName: "Petugas Tata Usaha",
    recipientName: "",
    recipientProof: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form, {
      onSuccess: () => {
        onClose();
        setForm({
          outgoingLetterId: "",
          dispatchDate: new Date().toISOString().split("T")[0],
          courierName: "Petugas Tata Usaha",
          recipientName: "",
          recipientProof: "",
          notes: "",
        });
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Ekspedisi Surat Keluar (F-TU-11)"
      description="Dokumentasikan bukti pengiriman fisik dan tanda terima naskah dinas."
    >
      <form onSubmit={handleSubmit} className="space-y-3 mt-3 text-xs">
        <div>
          <label className="block text-slate-700 font-medium mb-1">ID Surat Keluar (UUID)</label>
          <input
            type="text"
            required
            value={form.outgoingLetterId}
            onChange={(e) => setForm({ ...form, outgoingLetterId: e.target.value })}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            placeholder="018f3a2c-..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Tanggal Kirim</label>
            <input
              type="date"
              required
              value={form.dispatchDate}
              onChange={(e) => setForm({ ...form, dispatchDate: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Nama Kurir / Pengantar</label>
            <input
              type="text"
              required
              value={form.courierName}
              onChange={(e) => setForm({ ...form, courierName: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Nama Penerima / Satuan Kerja</label>
          <input
            type="text"
            required
            value={form.recipientName}
            onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            placeholder="Bagian Ortala Kanwil Kemenag"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Bukti Penerimaan / No. Resi</label>
          <input
            type="text"
            value={form.recipientProof || ""}
            onChange={(e) => setForm({ ...form, recipientProof: e.target.value })}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            placeholder="Resi POS / Tanda Tangan Penerima"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Catatan Tambahan</label>
          <textarea
            rows={2}
            value={form.notes || ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
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
            {createMutation.isPending ? "Menyimpan..." : "Simpan ke Ekspedisi"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
