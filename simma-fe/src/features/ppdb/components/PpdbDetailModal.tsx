import React, { useRef } from "react";
import type { PpdbApplicant, PpdbStatus } from "../types";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { API_ENDPOINTS } from "../../../config/endpoints";

interface PpdbDetailModalProps {
  applicant: PpdbApplicant | null;
  newStatus: PpdbStatus;
  notes: string;
  isSaving: boolean;
  onClose: () => void;
  onStatusChange: (status: PpdbStatus) => void;
  onNotesChange: (notes: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PpdbDetailModal: React.FC<PpdbDetailModalProps> = ({
  applicant,
  newStatus,
  notes,
  isSaving,
  onClose,
  onStatusChange,
  onNotesChange,
  onSubmit,
}) => {
  const statusSelectRef = useRef<HTMLSelectElement>(null);

  if (!applicant) return null;

  return (
    <Modal
      isOpen={Boolean(applicant)}
      onClose={onClose}
      title="Verifikasi & Penetapan Seleksi PPDB"
      initialFocus={statusSelectRef as unknown as React.MutableRefObject<HTMLElement | null>}
      maxWidth="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <span className="text-[11px] text-slate-500 block">Nomor Pendaftaran</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              {applicant.registrationNumber}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Pilihan Peminatan</span>
            <span className="font-semibold text-slate-800 text-sm">
              {applicant.chosenMajor}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Nama Calon Siswa</span>
            <span className="font-semibold text-slate-800">{applicant.fullName}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">NIK / NISN</span>
            <span className="font-mono text-slate-700">
              {applicant.nik} {applicant.nisn ? `(${applicant.nisn})` : ""}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">TTL & Kelamin</span>
            <span className="text-slate-700">
              {applicant.birthPlace}, {applicant.birthDate} (
              {applicant.gender === "L" ? "Laki-laki" : "Perempuan"})
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Asal Sekolah</span>
            <span className="text-slate-700">
              {applicant.previousSchoolType} — {applicant.previousSchoolName}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Nama Ibu Kandung (EMIS)</span>
            <span className="font-medium text-slate-800">{applicant.motherName}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Kontak / HP</span>
            <span className="text-slate-700">
              {applicant.phone || applicant.motherPhone || "-"}
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Status Verifikasi / Seleksi
            </label>
            <select
              ref={statusSelectRef}
              value={newStatus}
              disabled={applicant.status === "enrolled"}
              onChange={(e) => onStatusChange(e.target.value as PpdbStatus)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="submitted">Menunggu Verifikasi (Submitted)</option>
              <option value="verified">Terverifikasi / Lolos Berkas (Verified)</option>
              <option value="accepted">Diterima di Madrasah (Accepted)</option>
              <option value="rejected">Ditolak / Belum Lolos (Rejected)</option>
              {applicant.status === "enrolled" && (
                <option value="enrolled" disabled>
                  Sudah Masuk Buku Induk (Enrolled)
                </option>
              )}
            </select>
            {applicant.status === "enrolled" && (
              <p className="text-[11px] text-amber-600 mt-1">
                Calon siswa sudah resmi tercatat di Buku Induk Siswa (status tidak dapat diubah).
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Panitia (Alasan / Informasi Seleksi)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Contoh: Berkas fisik KK/Akta lengkap. Lolos wawancara dan tes tahfidz."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              window.open(
                `/api/v1${API_ENDPOINTS.PPDB.APPLICANT_CARD_PDF(applicant.id)}`,
                "_blank"
              );
            }}
          >
            Cetak Kartu PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Tutup
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSaving || applicant.status === "enrolled"}
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
