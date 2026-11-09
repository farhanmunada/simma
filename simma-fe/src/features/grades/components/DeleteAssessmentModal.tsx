import React from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";

interface DeleteAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const DeleteAssessmentModal: React.FC<DeleteAssessmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Hapus Penilaian"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-600">
          Apakah Anda yakin ingin menghapus rencana penilaian ini? Tindakan ini tidak dapat
          dibatalkan jika sudah memiliki nilai siswa.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={isLoading}
            onClick={onConfirm}
          >
            Hapus
          </Button>
        </div>
      </div>
    </Modal>
  );
};
