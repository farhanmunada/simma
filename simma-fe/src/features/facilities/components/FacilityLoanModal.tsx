import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import type { FacilityAsset, FacilityLoan } from "../types";
import {
  useCreateFacilityLoan,
  useReturnFacilityLoan,
} from "../api/facilities.api";

interface FacilityLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset?: FacilityAsset | null;
  loanToReturn?: FacilityLoan | null;
  availableAssets: FacilityAsset[];
}

export const FacilityLoanModal: React.FC<FacilityLoanModalProps> = ({
  isOpen,
  onClose,
  selectedAsset,
  loanToReturn,
  availableAssets,
}) => {
  const isReturnMode = Boolean(loanToReturn);

  const [assetId, setAssetId] = useState("");
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerType, setBorrowerType] = useState("GTK");
  const [loanDate, setLoanDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnCondition, setReturnCondition] = useState("BAIK");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createLoanMutation = useCreateFacilityLoan();
  const returnLoanMutation = useReturnFacilityLoan();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    if (loanToReturn) {
      setAssetId(loanToReturn.assetId);
      setBorrowerName(loanToReturn.borrowerName);
      setReturnDate(today);
      setReturnCondition("BAIK");
      setNotes("");
    } else {
      setAssetId(selectedAsset ? selectedAsset.id : availableAssets[0]?.id || "");
      setBorrowerName("");
      setBorrowerType("GTK");
      setLoanDate(today);
      setDueDate(threeDaysLater);
      setNotes("");
    }
    setError(null);
  }, [isOpen, selectedAsset, loanToReturn, availableAssets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isReturnMode && loanToReturn) {
        await returnLoanMutation.mutateAsync({
          id: loanToReturn.id,
          data: {
            returnDate: returnDate || undefined,
            condition: returnCondition as any,
            notes: notes || undefined,
          },
        });
      } else {
        if (!assetId) {
          setError("Pilih aset yang akan dipinjam.");
          return;
        }
        if (!borrowerName.trim()) {
          setError("Nama peminjam wajib diisi.");
          return;
        }

        await createLoanMutation.mutateAsync({
          assetId,
          borrowerName,
          borrowerType: borrowerType as any,
          loanDate,
          dueDate,
          notes: notes || undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "Gagal memproses transaksi peminjaman");
    }
  };

  const isSaving =
    createLoanMutation.isPending || returnLoanMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReturnMode ? "Pengembalian Aset Sarpras" : "Peminjaman Aset Baru"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
            {error}
          </div>
        )}

        {isReturnMode ? (
          <>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div>
                <span className="font-semibold text-slate-700">Peminjam:</span>{" "}
                {borrowerName}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Tgl Pinjam:</span>{" "}
                {loanToReturn?.loanDate}
              </div>
            </div>
            <Input
              label="Tanggal Pengembalian Realistis *"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required
            />
            <Select
              label="Kondisi Saat Dikembalikan"
              value={returnCondition}
              onChange={(e) => setReturnCondition(e.target.value)}
              options={[
                { value: "BAIK", label: "Baik (Lengkap & Berfungsi Normal)" },
                { value: "RUSAK_RINGAN", label: "Rusak Ringan (Perlu Servis Kecil)" },
                { value: "RUSAK_BERAT", label: "Rusak Berat (Tidak Berfungsi)" },
              ]}
            />
          </>
        ) : (
          <>
            <Select
              label="Pilih Aset Tersedia *"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              options={availableAssets.map((a) => ({
                value: a.id,
                label: `${a.name} (${a.code}) - ${a.location || "Tanpa Lokasi"}`,
              }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nama Lengkap Peminjam *"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="Nama guru/siswa/pihak luar"
                required
              />
              <Select
                label="Tipe Peminjam"
                value={borrowerType}
                onChange={(e) => setBorrowerType(e.target.value)}
                options={[
                  { value: "GTK", label: "Guru / Tenaga Kependidikan" },
                  { value: "SISWA", label: "Siswa Santri" },
                  { value: "EKSTERNAL", label: "Pihak Eksternal" },
                ]}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Tanggal Pinjam *"
                type="date"
                value={loanDate}
                onChange={(e) => setLoanDate(e.target.value)}
                required
              />
              <Input
                label="Batas Kembali (Due Date) *"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Catatan Tambahan
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Keperluan pemakaian (acara/kegiatan/kelas)"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving
              ? "Memproses..."
              : isReturnMode
                ? "Konfirmasi Kembali"
                : "Catat Peminjaman"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
