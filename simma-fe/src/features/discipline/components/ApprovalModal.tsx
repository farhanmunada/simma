import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { StudentInfractionItem } from "../types";

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  infraction: StudentInfractionItem | null;
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, notes: string) => Promise<void>;
  isLoading?: boolean;
}

export function ApprovalModal({
  isOpen,
  onClose,
  infraction,
  onApprove,
  onReject,
  isLoading,
}: ApprovalModalProps) {
  const [notes, setNotes] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");

  if (!infraction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actionType === "approve") {
      await onApprove(infraction.id, notes);
    } else {
      await onReject(infraction.id, notes);
    }
    setNotes("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Otorisasi Pelanggaran / Kejadian Santri"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-800 text-sm">
              {infraction.studentName ?? "Santri"}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
              {infraction.points} Poin ({infraction.category})
            </span>
          </div>
          <p className="text-slate-700 font-medium">{infraction.title}</p>
          {infraction.description && (
            <p className="text-slate-500 italic">{infraction.description}</p>
          )}
          <div className="text-[11px] text-slate-500 flex gap-4 pt-1 border-t border-slate-200">
            <span>Pelapor: {infraction.reporterName ?? "Guru/Staf"}</span>
            <span>Tanggal: {infraction.date}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 p-2 rounded-lg border text-center font-semibold flex items-center justify-center gap-1.5 transition ${
              actionType === "approve"
                ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            onClick={() => setActionType("approve")}
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Setujui (Approve)
          </button>
          <button
            type="button"
            className={`flex-1 p-2 rounded-lg border text-center font-semibold flex items-center justify-center gap-1.5 transition ${
              actionType === "reject"
                ? "bg-rose-50 border-rose-500 text-rose-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            onClick={() => setActionType("reject")}
          >
            <XCircle className="w-4 h-4 text-rose-600" /> Tolak (Reject)
          </button>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">
            Catatan Otorisasi {actionType === "reject" && <span className="text-rose-500">*</span>}
          </label>
          <textarea
            required={actionType === "reject"}
            rows={3}
            className="w-full rounded-md border border-slate-300 p-2 text-xs focus:ring-1 focus:ring-emerald-500"
            placeholder={
              actionType === "approve"
                ? "Catatan pembinaan / instruksi ke wali kelas (opsional)..."
                : "Alasan penolakan laporan pelanggaran (wajib diisi)..."
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {actionType === "approve" && infraction.points >= 50 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded text-[11px] flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Persetujuan ini akan mengakumulasikan {infraction.points} poin ke saldo santri dan berpotensi memicu otomatis eskalasi sanksi (SP/Pemanggilan Orang Tua).
            </span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            type="submit"
            className={actionType === "reject" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : actionType === "approve" ? "Konfirmasi Setujui" : "Konfirmasi Tolak"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
