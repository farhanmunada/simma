import React, { useState } from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { useApproveTransfer } from "../api/transfers.api";
import type { TransferItem } from "../types";

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: TransferItem | null;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  transfer,
}) => {
  const approveMutation = useApproveTransfer();
  const [notes, setNotes] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  if (!transfer) return null;

  const handleDecision = (approved: boolean) => {
    approveMutation.mutate(
      {
        id: transfer.id,
        approved,
        notes: notes.trim() || (approved ? "Disetujui oleh Kepala Madrasah" : "Ditolak"),
      },
      {
        onSuccess: () => {
          onClose();
          setNotes("");
          setIsRejecting(false);
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Persetujuan Kepala Madrasah" maxWidth="md">
      <div className="space-y-4">
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-600 mt-0.5" />
          <div className="text-xs text-purple-900">
            <p className="font-semibold text-sm">Penerbitan Surat Mutasi Keluar Resmi</p>
            <p className="mt-0.5">
              Seluruh clearance (Perpustakaan, Keuangan, BK) telah selesai. Menyetujui permohonan ini akan otomatis menerbitkan <strong>Kode Verifikasi Unik (QR/Hex)</strong> dan memperbarui status siswa menjadi <strong>MUTASI_KELUAR</strong>.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded border text-xs space-y-1.5">
          <p><span className="text-slate-500">Nama Siswa:</span> <strong>{transfer.studentName}</strong></p>
          <p><span className="text-slate-500">Sekolah Tujuan:</span> <strong>{transfer.destinationSchool ?? "-"}</strong></p>
          <p><span className="text-slate-500">Alasan Pindah:</span> {transfer.reason ?? "-"}</p>
          <p><span className="text-slate-500">No. Referensi:</span> {transfer.referenceNumber}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Catatan Kepala Madrasah (Opsional):
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tambahkan disposisi atau catatan tambahan..."
            className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        {isRejecting ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs space-y-2">
            <div className="flex items-center gap-2 text-red-700 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Konfirmasi Penolakan Mutasi</span>
            </div>
            <p className="text-red-600">
              Apakah Anda yakin ingin menolak permohonan mutasi keluar ini? Siswa akan tetap berstatus aktif di kelas asalnya.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setIsRejecting(false)}>
                Batal
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={approveMutation.isPending}
                onClick={() => handleDecision(false)}
              >
                Ya, Tolak Permohonan
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setIsRejecting(true)}
            >
              Tolak Permohonan
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={approveMutation.isPending}
                onClick={() => handleDecision(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {approveMutation.isPending ? "Memproses..." : "Setujui & Terbitkan Surat"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
