import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { useUpdateDispositionStatus } from "../api/letters.api";
import type { Disposition, DispositionStatus } from "../types";

export interface FollowUpDispositionModalProps {
  disposition: Disposition | null;
  onClose: () => void;
}

export const FollowUpDispositionModal: React.FC<FollowUpDispositionModalProps> = ({
  disposition,
  onClose,
}) => {
  const updateMutation = useUpdateDispositionStatus();
  const [targetStatus, setTargetStatus] = useState<DispositionStatus>("completed");
  const [followUpNotes, setFollowUpNotes] = useState("");

  useEffect(() => {
    if (disposition) {
      setTargetStatus(disposition.status === "pending" ? "in_progress" : "completed");
      setFollowUpNotes(disposition.followUpNotes || "");
    }
  }, [disposition]);

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disposition) return;
    updateMutation.mutate(
      {
        id: disposition.id,
        data: {
          status: targetStatus,
          followUpNotes: followUpNotes || undefined,
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
      isOpen={Boolean(disposition)}
      onClose={onClose}
      title="Perbarui Status & Tindak Lanjut"
    >
      <form onSubmit={handleUpdateStatus} className="space-y-3 mt-3 text-xs">
        <div>
          <label className="block text-slate-700 font-medium mb-1">Status Pengerjaan</label>
          <select
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value as DispositionStatus)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
          >
            <option value="in_progress">Sedang Diproses</option>
            <option value="completed">Selesai Ditindaklanjuti</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Laporan Tindak Lanjut</label>
          <textarea
            rows={3}
            value={followUpNotes}
            onChange={(e) => setFollowUpNotes(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
            placeholder="Jelaskan hasil tindak lanjut instruksi kamad..."
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
            disabled={updateMutation.isPending}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
          >
            {updateMutation.isPending ? "Menyimpan..." : "Simpan Status"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
