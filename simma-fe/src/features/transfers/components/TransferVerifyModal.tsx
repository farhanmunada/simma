import React, { useState } from "react";
import { QrCode, Search, CheckCircle2, XCircle } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { useVerifyTransfer } from "../api/transfers.api";

interface TransferVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferVerifyModal: React.FC<TransferVerifyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [inputCode, setInputCode] = useState("");
  const [searchedCode, setSearchedCode] = useState("");

  const { data: result, isLoading, isError } = useVerifyTransfer(searchedCode);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setSearchedCode(inputCode.trim().toUpperCase());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verifikasi Keaslian Surat Mutasi" maxWidth="md">
      <div className="space-y-4">
        <div className="p-3 bg-slate-50 border rounded-lg text-xs text-slate-600 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-slate-500 shrink-0" />
          <span>
            Masukkan 8 digit kode verifikasi yang tertera di pojok dokumen cetak surat keterangan mutasi.
          </span>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            maxLength={10}
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="Contoh: A1B2C3D4"
            className="flex-1 font-mono text-sm px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none uppercase"
          />
          <Button type="submit" variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Search className="w-4 h-4 mr-1" />
            Cek Kode
          </Button>
        </form>

        {isLoading && (
          <div className="py-6 text-center text-xs text-slate-500">
            Memverifikasi tanda tangan digital...
          </div>
        )}

        {isError && searchedCode && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Dokumen tidak ditemukan atau kode verifikasi tidak valid.</span>
          </div>
        )}

        {result && (
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                DOKUMEN ASLI & TERVERIFIKASI
              </span>
              <Badge variant="success" size="sm">SAH</Badge>
            </div>
            <p><span className="text-slate-500">Nomor Surat:</span> <strong>{result.referenceNumber}</strong></p>
            <p><span className="text-slate-500">Nama Siswa:</span> <strong>{result.studentName}</strong></p>
            <p><span className="text-slate-500">NISN:</span> {result.studentNisn ?? "-"}</p>
            <p><span className="text-slate-500">Sekolah Tujuan:</span> {result.destinationSchool ?? "-"}</p>
            <p><span className="text-slate-500">Tanggal Terbit:</span> {result.transferDate}</p>
            <p><span className="text-slate-500">Disetujui Oleh:</span> {result.approverName ?? "Kepala Madrasah"}</p>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
};
