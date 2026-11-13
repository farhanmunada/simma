import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { FacilityImageUpload } from "./FacilityImageUpload";
import type { FacilityAsset } from "../types";
import {
  useCreateFacilityAsset,
  useUpdateFacilityAsset,
} from "../api/facilities.api";

interface FacilityAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetToEdit?: FacilityAsset | null;
}

export const FacilityAssetModal: React.FC<FacilityAssetModalProps> = ({
  isOpen,
  onClose,
  assetToEdit,
}) => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("ELEKTRONIK");
  const [condition, setCondition] = useState("BAIK");
  const [location, setLocation] = useState("");
  const [sourceOfFund, setSourceOfFund] = useState("BOS");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [frontImageUrl, setFrontImageUrl] = useState("");
  const [detailImageUrl, setDetailImageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateFacilityAsset();
  const updateMutation = useUpdateFacilityAsset();

  useEffect(() => {
    if (assetToEdit) {
      setCode(assetToEdit.code);
      setName(assetToEdit.name);
      setCategory(assetToEdit.category);
      setCondition(assetToEdit.condition);
      setLocation(assetToEdit.location || "");
      setSourceOfFund(assetToEdit.sourceOfFund || "BOS");
      setPurchaseDate(assetToEdit.purchaseDate || "");
      setFrontImageUrl(assetToEdit.frontImageUrl || "");
      setDetailImageUrl(assetToEdit.detailImageUrl || "");
      setNotes(assetToEdit.notes || "");
    } else {
      setCode(`AST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setName("");
      setCategory("ELEKTRONIK");
      setCondition("BAIK");
      setLocation("");
      setSourceOfFund("BOS");
      setPurchaseDate(new Date().toISOString().split("T")[0]);
      setFrontImageUrl("");
      setDetailImageUrl("");
      setNotes("");
    }
    setError(null);
  }, [assetToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim() || !name.trim()) {
      setError("Kode dan nama aset wajib diisi.");
      return;
    }

    try {
      if (assetToEdit) {
        await updateMutation.mutateAsync({
          id: assetToEdit.id,
          data: {
            code: code.trim(),
            name: name.trim(),
            category: category as any,
            condition: condition as any,
            location: location.trim() ? location.trim() : null,
            sourceOfFund: sourceOfFund.trim() ? sourceOfFund.trim() : null,
            purchaseDate: purchaseDate.trim() ? purchaseDate.trim() : null,
            frontImageUrl: frontImageUrl.trim() ? frontImageUrl.trim() : null,
            detailImageUrl: detailImageUrl.trim() ? detailImageUrl.trim() : null,
            notes: notes.trim() ? notes.trim() : null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          code: code.trim(),
          name: name.trim(),
          category: category as any,
          condition: condition as any,
          location: location.trim() ? location.trim() : undefined,
          sourceOfFund: sourceOfFund.trim() ? sourceOfFund.trim() : undefined,
          purchaseDate: purchaseDate.trim() ? purchaseDate.trim() : undefined,
          frontImageUrl: frontImageUrl.trim() ? frontImageUrl.trim() : undefined,
          detailImageUrl: detailImageUrl.trim() ? detailImageUrl.trim() : undefined,
          notes: notes.trim() ? notes.trim() : undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan data aset");
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={assetToEdit ? "Edit Aset Sarpras" : "Tambah Aset Baru"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Kode Aset / Inventaris *"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Contoh: AST-2024-001"
            required
          />
          <Input
            label="Nama Aset / Barang *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Proyektor Epson EB-X500"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Kategori"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "ELEKTRONIK", label: "Elektronik" },
              { value: "FURNITUR", label: "Furnitur" },
              { value: "RUANGAN", label: "Ruangan" },
              { value: "LABORATORIUM", label: "Laboratorium" },
              { value: "KENDARAAN", label: "Kendaraan" },
            ]}
          />
          <Select
            label="Kondisi Awal"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            options={[
              { value: "BAIK", label: "Baik" },
              { value: "RUSAK_RINGAN", label: "Rusak Ringan" },
              { value: "RUSAK_BERAT", label: "Rusak Berat" },
            ]}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Lokasi Penempatan"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Contoh: Ruang Guru / Lab Multimedia"
          />
          <Input
            label="Sumber Dana"
            value={sourceOfFund}
            onChange={(e) => setSourceOfFund(e.target.value)}
            placeholder="Contoh: BOS, Komite, Hibah"
          />
        </div>
        <Input
          label="Tanggal Pembelian / Pengadaan"
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FacilityImageUpload
            label="Foto 1: Tampak Depan"
            sublabel="Wajib/Dokumentasi"
            value={frontImageUrl}
            onChange={setFrontImageUrl}
            disabled={isSaving}
          />
          <FacilityImageUpload
            label="Foto 2: Label Resmi Pabrikan"
            sublabel="Serial / Spesifikasi"
            value={detailImageUrl}
            onChange={setDetailImageUrl}
            disabled={isSaving}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Catatan / Spesifikasi Singkat</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Serial number, spesifikasi RAM/processor, atau nomor register"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Menyimpan..." : assetToEdit ? "Simpan Perubahan" : "Daftarkan Aset"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
